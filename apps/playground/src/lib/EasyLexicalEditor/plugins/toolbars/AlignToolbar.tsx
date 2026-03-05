import { useCallback } from "react";
import { $getSelection, $isRangeSelection, FORMAT_ELEMENT_COMMAND } from "lexical";

import type { ElementFormatType, LexicalEditor } from "lexical";

function parseStyle(str: string): Record<string, string> {
  const out: Record<string, string> = {};
  (str || "").split(";").map((s) => s.trim()).filter(Boolean).forEach((pair) => {
    const idx = pair.indexOf(":");
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim().toLowerCase();
    const v = pair.slice(idx + 1).trim();
    out[k] = v;
  });
  return out;
}

function stringifyStyle(obj: Record<string, string>): string {
  return Object.keys(obj).sort().map((k) => `${k}: ${obj[k]}`).join("; ");
}

function upsertStyleProp(styleStr: string, key: string, value: string): string {
  const map = parseStyle(styleStr);
  if (!value) {
    delete map[key];
  } else {
    map[key] = value;
  }
  return stringifyStyle(map);
}

export default function AlignToolbar({ editor }: { editor: LexicalEditor }) {
  const setAlign = useCallback(
    (align: string) => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align as ElementFormatType);

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const topBlocks = new Map<string, ReturnType<typeof selection.anchor.getNode>>();

        if (selection.isCollapsed()) {
          const anchor = selection.anchor.getNode();
          const top = anchor.getTopLevelElementOrThrow?.();
          if (top) topBlocks.set(top.getKey(), top);
        } else {
          selection.getNodes().forEach((n) => {
            const top = n.getTopLevelElementOrThrow?.();
            if (top && !topBlocks.has(top.getKey())) {
              topBlocks.set(top.getKey(), top);
            }
          });
        }

        topBlocks.forEach((block) => {
          if (typeof (block as Record<string, unknown>).getStyle === "function" && typeof (block as Record<string, unknown>).setStyle === "function") {
            const prev = (block as unknown as { getStyle: () => string }).getStyle() || "";
            const next = upsertStyleProp(prev, "text-align", align);
            (block as unknown as { setStyle: (s: string) => void }).setStyle(next);
          }
        });
      });
    },
    [editor],
  );

  return (
    <>
      <button onClick={() => setAlign("left")} className="toolbar-item spaced" aria-label="Left Align">
        <i className="format left-align" />
      </button>
      <button onClick={() => setAlign("center")} className="toolbar-item spaced" aria-label="Center Align">
        <i className="format center-align" />
      </button>
      <button onClick={() => setAlign("right")} className="toolbar-item spaced" aria-label="Right Align">
        <i className="format right-align" />
      </button>
      <button onClick={() => setAlign("justify")} className="toolbar-item" aria-label="Justify Align">
        <i className="format justify-align" />
      </button>
    </>
  );
}
