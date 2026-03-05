import DOMPurify from "dompurify";
import { TextNode, $isTextNode } from "lexical";

import type { DOMConversionMap } from "lexical";

function sanitizeStyle(style = ""): string {
  const allowed =
    /^(color|background-color|font-weight|font-style|text-decoration(-line)?|font-size|font-family|letter-spacing|line-height|white-space|word-break|text-transform|vertical-align)\s*:/i;
  return style
    .split(";")
    .map((s) => s.trim())
    .filter((s) => allowed.test(s))
    .join("; ");
}

function wrapImporter(orig?: ((el: HTMLElement) => { conversion: (element: HTMLElement) => unknown } | null) | null) {
  return (el: HTMLElement) => {
    const importer = orig ? orig(el) : { conversion: () => ({ forChild: (c: unknown) => c }) };
    if (!importer) return null;
    return {
      ...importer,
      conversion: (element: HTMLElement) => {
        const res = (importer as { conversion: (element: HTMLElement) => Record<string, unknown> | null }).conversion(element);
        if (!res) return res;

        const raw = element.getAttribute?.("style") || "";
        const safe = sanitizeStyle(
          DOMPurify.sanitize(`<span style="${raw}"></span>`, {
            ALLOWED_TAGS: ["span"],
            ALLOWED_ATTR: ["style"],
          }).match(/style="([^"]*)"/i)?.[1] || "",
        );
        if (!safe || !(res as Record<string, unknown>).forChild) return res;

        return {
          ...res,
          forChild: (child: unknown, parent: unknown) => {
            const out = (res.forChild as (child: unknown, parent: unknown) => unknown)(child, parent);
            if ($isTextNode(out as Parameters<typeof $isTextNode>[0])) {
              const textNode = out as InstanceType<typeof TextNode>;
              const prev = textNode.getStyle?.() || "";
              const merged = [prev, safe].filter(Boolean).join("; ");
              textNode.setStyle(merged);
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
  tags.forEach((t) => (map[t] = wrapImporter((base as Record<string, unknown>)?.[t] as ((el: HTMLElement) => { conversion: (element: HTMLElement) => unknown } | null) | undefined)));
  return map;
}
