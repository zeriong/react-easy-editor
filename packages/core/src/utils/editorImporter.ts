import DOMPurify from "dompurify";
import { TextNode, $isTextNode } from "lexical";

import type { DOMConversionMap, DOMConversion, DOMConversionOutput, LexicalNode } from "lexical";

function sanitizeStyle(style = ""): string {
  const allowed =
    /^(color|background-color|font-weight|font-style|text-decoration(-line)?|font-size|font-family|letter-spacing|line-height|white-space|word-break|text-transform|vertical-align)\s*:/i;
  return style
    .split(";")
    .map((s) => s.trim())
    .filter((s) => allowed.test(s))
    .join("; ");
}

type ImporterFn = (el: HTMLElement) => DOMConversion<HTMLElement> | null;

function wrapImporter(orig?: ImporterFn | null): ImporterFn {
  return (el: HTMLElement): DOMConversion<HTMLElement> | null => {
    const importer = orig
      ? orig(el)
      : ({ conversion: () => ({ node: null as unknown as LexicalNode, forChild: (c: LexicalNode) => c }) } as DOMConversion<HTMLElement>);
    if (!importer) return null;
    return {
      ...importer,
      conversion: (element: HTMLElement): DOMConversionOutput | null => {
        const res = importer.conversion(element);
        if (!res) return res;

        const raw = element.getAttribute?.("style") || "";
        const safe = sanitizeStyle(
          DOMPurify.sanitize(`<span style="${raw}"></span>`, {
            ALLOWED_TAGS: ["span"],
            ALLOWED_ATTR: ["style"],
          }).match(/style="([^"]*)"/i)?.[1] || "",
        );
        if (!safe || !res.forChild) return res;

        return {
          ...res,
          forChild: (child: LexicalNode, parent: LexicalNode | null | undefined): LexicalNode | null | undefined => {
            const out = res.forChild!(child, parent);
            if (out && $isTextNode(out)) {
              const prev = out.getStyle?.() || "";
              const merged = [prev, safe].filter(Boolean).join("; ");
              out.setStyle(merged);
            }
            return out;
          },
        };
      },
    };
  };
}

export function buildInlineStyleImportMap(): DOMConversionMap {
  const base = TextNode.importDOM ? TextNode.importDOM() : {};
  const tags = [
    "span",
    "font",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "strike",
    "mark",
    "code",
    "sub",
    "sup",
  ];
  const map: DOMConversionMap = {};
  tags.forEach((t) => {
    map[t] = wrapImporter((base as Record<string, ImporterFn | undefined>)?.[t] ?? null);
  });
  return map;
}
