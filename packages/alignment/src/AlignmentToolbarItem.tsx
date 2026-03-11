import { useCallback } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import {
  useEditorLocale,
  getNodeStyle,
  setNodeStyle,
  TextLeftIcon,
  TextCenterIcon,
  TextRightIcon,
  JustifyIcon,
} from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ElementFormatType } from "lexical";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Alignment toolbar — 4 inline buttons matching origin               */
/* ------------------------------------------------------------------ */

function upsertStyleProp(styleStr: string, key: string, value: string): string {
  const map: Record<string, string> = {};
  (styleStr || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const idx = pair.indexOf(":");
      if (idx === -1) return;
      const k = pair.slice(0, idx).trim().toLowerCase();
      const v = pair.slice(idx + 1).trim();
      map[k] = v;
    });

  if (!value) {
    delete map[key];
  } else {
    map[key] = value;
  }

  return Object.keys(map)
    .sort()
    .map((k) => `${k}: ${map[k]}`)
    .join("; ");
}

export function AlignmentToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const { t } = useEditorLocale();

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
          const prev = getNodeStyle(block);
          if (prev !== null) {
            const next = upsertStyleProp(prev, "text-align", align);
            setNodeStyle(block, next);
          }
        });
      });
    },
    [editor],
  );

  return (
    <>
      <button
        onClick={() => setAlign("left")}
        className="toolbar-item spaced"
        aria-label={t("Left Align")}
        data-tooltip={t("Left Align")}
      >
        <TextLeftIcon />
      </button>
      <button
        onClick={() => setAlign("center")}
        className="toolbar-item spaced"
        aria-label={t("Center Align")}
        data-tooltip={t("Center Align")}
      >
        <TextCenterIcon />
      </button>
      <button
        onClick={() => setAlign("right")}
        className="toolbar-item spaced"
        aria-label={t("Right Align")}
        data-tooltip={t("Right Align")}
      >
        <TextRightIcon />
      </button>
      <button
        onClick={() => setAlign("justify")}
        className="toolbar-item"
        aria-label={t("Justify Align")}
        data-tooltip={t("Justify Align")}
      >
        <JustifyIcon />
      </button>
    </>
  );
}
