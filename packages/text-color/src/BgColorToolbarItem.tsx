import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useEditorLocale, FadeAnimate, HighlighterIcon } from "@react-easy-editor/core";
import { DEFAULT_BG_COLORS } from "./ColorPicker";
import { extractStyleValue } from "./extractStyleValue";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  BgColorToolbarItem                                                 */
/* ------------------------------------------------------------------ */

export interface BgColorToolbarItemOptions {
  colors?: string[];
}

export function createBgColorToolbarItem(options: BgColorToolbarItemOptions = {}) {
  const colors = options.colors ?? DEFAULT_BG_COLORS;

  return function BgColorToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
    const previewBoxRef = useRef<HTMLDivElement>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const { t } = useEditorLocale();

    const setPreviewColor = useCallback(
      (color: string) => {
        const el = previewBoxRef.current;
        if (!el) return;
        el.style.backgroundColor = color || "transparent";
      },
      [],
    );

    const refreshPreviewFromSelection = useCallback(() => {
      editor.getEditorState().read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) {
          setPreviewColor("transparent");
          return;
        }

        if (sel.isCollapsed()) {
          const node = sel.anchor.getNode();
          if ($isTextNode(node)) {
            const c = extractStyleValue(node.getStyle?.() || "", "background-color");
            setPreviewColor(c || "transparent");
            return;
          }
          setPreviewColor("transparent");
          return;
        }

        const nodes = sel.getNodes();
        let picked: string | null = null;
        for (const n of nodes) {
          if ($isTextNode(n)) {
            const c = extractStyleValue(n.getStyle?.() || "", "background-color");
            if (c) {
              picked = c;
              break;
            }
          }
        }
        setPreviewColor(picked || "transparent");
      });
    }, [editor, setPreviewColor]);

    const updateBgColor = useCallback(
      (backgroundColor: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { "background-color": backgroundColor });
          }
        });
        setPreviewColor(backgroundColor);
      },
      [editor, setPreviewColor],
    );

    const applyPreviewBgToSelection = useCallback(() => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const el = previewBoxRef.current;
        if (!el) return;

        let color = el.style.backgroundColor;
        if (!color) {
          const cs = window.getComputedStyle(el);
          color = cs ? cs.backgroundColor : "";
        }
        if (!color) return;

        $patchStyleText(selection, { "background-color": color });
      });
    }, [editor]);

    /* Popover toggle via global click handler (matching origin pattern) */
    useEffect(() => {
      function handleTextBgPopover(e: MouseEvent) {
        const cls = (e.target as HTMLElement)?.classList;
        if (!cls) return;

        if (cls.contains("text-color-popover")) return;

        if (cls.contains("text-setting-popover-button") && cls.contains("text-bg-color")) {
          setIsPopoverOpen(true);
        } else {
          setIsPopoverOpen(false);
        }
      }

      window.addEventListener("click", handleTextBgPopover);
      return () => window.removeEventListener("click", handleTextBgPopover);
    }, []);

    /* Track selection changes to update preview color */
    useEffect(() => {
      const removeSel = editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          refreshPreviewFromSelection();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      );
      const removeUpdate = editor.registerUpdateListener(() => {
        refreshPreviewFromSelection();
      });

      refreshPreviewFromSelection();

      return () => {
        removeSel();
        removeUpdate();
      };
    }, [editor, refreshPreviewFromSelection]);

    return (
      <button
        className="toolbar-item spaced text-bg-color"
        aria-label={t("Background Color")}
        data-tooltip={t("Background Color")}
        style={isPopoverOpen ? { backgroundColor: "#eee" } : {}}
        onClick={applyPreviewBgToSelection}
      >
        <div className="text-setting bg-color">
          <HighlighterIcon />
          <div ref={previewBoxRef} className="color-preview" />
        </div>

        <div className="text-setting-popover-button text-bg-color" />

        <FadeAnimate className="text-bg-color-popover" isVisible={isPopoverOpen}>
          {colors.map((c, i) => {
            const isTransparent = c === "transparent";
            return (
              <div
                key={`text_bg_color_${i}`}
                className="color-preview-box"
                onClick={() => updateBgColor(c)}
              >
                <div
                  className={`color-preview-box-el${isTransparent ? " transparent" : ""}`}
                  style={{ backgroundColor: c }}
                />
              </div>
            );
          })}
        </FadeAnimate>
      </button>
    );
  };
}
