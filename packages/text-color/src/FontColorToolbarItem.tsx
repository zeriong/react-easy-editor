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
import { ColorPicker, DEFAULT_TEXT_COLORS } from "./ColorPicker";
import { extractStyleValue } from "./extractStyleValue";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Font color icon (Bootstrap Icons style "A" with color bar)         */
/* ------------------------------------------------------------------ */

function FontColorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M8.637 1.276a.24.24 0 0 0-.474 0L4.106 13h1.308l1.27-3.666h2.632L10.586 13h1.308L8.637 1.276zM8.4 3.58l1.263 4.254H7.137L8.4 3.58z" />
    </svg>
  );
}

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
        setIsPopoverOpen(false);
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

    /* Close popover on outside click */
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target) return;

        const popover = target.closest(".text-color-popover");
        if (popover) return;

        const button = target.closest(".toolbar-item.text-color");
        if (button) return;

        setIsPopoverOpen(false);
      }

      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
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
          <FontColorIcon />
          <div ref={previewBoxRef} className="color-preview" />
        </div>

        <div
          className="text-setting-popover-button text-color"
          onClick={(e) => {
            e.stopPropagation();
            setIsPopoverOpen((prev) => !prev);
          }}
        />

        <FadeAnimate className="text-color-popover" isVisible={isPopoverOpen}>
          <ColorPicker
            colors={colors}
            onSelectColor={updateTextColor}
            className="text-color-grid"
          />
        </FadeAnimate>
      </button>
    );
  };
}
