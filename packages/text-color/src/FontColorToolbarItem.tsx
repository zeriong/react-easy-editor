import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { useEditorLocale, FadeAnimate } from "@react-easy-editor/core";
import { DEFAULT_TEXT_COLORS } from "./ColorPicker";
import { extractStyleValue } from "./extractStyleValue";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  FontColorToolbarItem                                               */
/* ------------------------------------------------------------------ */

export interface FontColorToolbarItemOptions {
  colors?: string[];
}

export function createFontColorToolbarItem(options: FontColorToolbarItemOptions = {}) {
  const colors = options.colors ?? DEFAULT_TEXT_COLORS;

  return function FontColorToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
    const previewBoxRef = useRef<HTMLDivElement>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const { t } = useEditorLocale();

    const setPreviewColor = useCallback(
      (color: string) => {
        const el = previewBoxRef.current;
        if (!el) return;
        el.style.backgroundColor = color || colors[0];
      },
      [colors],
    );

    const refreshPreviewFromSelection = useCallback(() => {
      editor.getEditorState().read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) {
          setPreviewColor(colors[0]);
          return;
        }

        if (sel.isCollapsed()) {
          const node = sel.anchor.getNode();
          if ($isTextNode(node)) {
            const c = extractStyleValue(node.getStyle?.() || "", "color");
            if (c) {
              setPreviewColor(c);
              return;
            }
          }

          const rootEl = editor.getRootElement();
          const winSel = rootEl?.ownerDocument?.getSelection();
          const anchorDom =
            winSel?.anchorNode instanceof Element
              ? winSel.anchorNode
              : winSel?.anchorNode?.parentElement;
          if (anchorDom) {
            const cs = window.getComputedStyle(anchorDom);
            if (cs?.color) {
              setPreviewColor(cs.color);
              return;
            }
          }

          setPreviewColor(colors[0]);
          return;
        }

        const nodes = sel.getNodes();
        for (const n of nodes) {
          if ($isTextNode(n)) {
            const c = extractStyleValue(n.getStyle?.() || "", "color");
            if (c) {
              setPreviewColor(c);
              return;
            }
          }
        }
        setPreviewColor(colors[0]);
      });
    }, [editor, setPreviewColor, colors]);

    const updateTextColor = useCallback(
      (color: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, { color });
          }
        });
        setPreviewColor(color);
      },
      [editor, setPreviewColor],
    );

    const applyPreviewColorToSelection = useCallback(() => {
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

        $patchStyleText(selection, { color });
      });
    }, [editor]);

    /* Popover toggle via global click handler (matching origin pattern) */
    useEffect(() => {
      function handleTextColorPopover(e: MouseEvent) {
        const cls = (e.target as HTMLElement)?.classList;
        if (!cls) return;

        if (cls.contains("text-color-popover")) return;

        if (cls.contains("text-setting-popover-button") && cls.contains("text-color")) {
          setIsPopoverOpen(true);
        } else {
          setIsPopoverOpen(false);
        }
      }

      window.addEventListener("click", handleTextColorPopover);
      return () => window.removeEventListener("click", handleTextColorPopover);
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
        className="toolbar-item spaced text-color"
        aria-label={t("Text Color")}
        data-tooltip={t("Text Color")}
        style={isPopoverOpen ? { backgroundColor: "#eee" } : {}}
        onClick={applyPreviewColorToSelection}
      >
        <div className="text-setting text-color">
          <span style={{ fontWeight: "500", fontSize: "15px" }}>A</span>
          <div ref={previewBoxRef} className="color-preview" />
        </div>

        <div className="text-setting-popover-button text-color" />

        <FadeAnimate className="text-color-popover" isVisible={isPopoverOpen}>
          {colors.map((c, i) => (
            <div
              key={`text_color_${i}`}
              className="color-preview-box"
              onClick={() => updateTextColor(c)}
            >
              <div className="color-preview-box-el" style={{ backgroundColor: c }} />
            </div>
          ))}
        </FadeAnimate>
      </button>
    );
  };
}
