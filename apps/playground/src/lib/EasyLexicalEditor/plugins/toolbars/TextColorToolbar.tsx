import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $patchStyleText } from "@lexical/selection";
import FadeAnimate from "../../components/common/FadeAnimate.tsx";

import type { LexicalEditor } from "lexical";

function extractStyleValue(styleStr: string, prop: string): string | null {
  if (!styleStr) return null;
  const parts = styleStr.split(";").map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const [k, ...rest] = p.split(":");
    if (!k || rest.length === 0) continue;
    if (k.trim().toLowerCase() === prop.toLowerCase()) {
      return rest.join(":").trim();
    }
  }
  return null;
}

export default function TextColorToolbar({ editor, textColors }: { editor: LexicalEditor; textColors: string[] }) {
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const [isPopover, setIsPopover] = useState(false);

  const setPreviewColor = useCallback((color: string) => {
    const el = previewBoxRef.current;
    if (!el) return;
    el.style.backgroundColor = color || textColors[0];
  }, []);

  const refreshPreviewFromSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) {
        setPreviewColor(textColors[0]);
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
        setPreviewColor(textColors[0]);
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
      setPreviewColor(textColors[0]);
    });
  }, [editor, setPreviewColor]);

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

  const applyPreviewTextColorToSelection = useCallback(() => {
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

  useEffect(() => {
    function handleTextColorPopover(e: MouseEvent) {
      const cls = (e.target as HTMLElement)?.classList || new DOMTokenList();

      if (cls.contains("text-color-popover")) return;

      if (cls.contains("text-setting-popover-button") && cls.contains("text-color")) {
        setIsPopover(true);
      } else {
        setIsPopover(false);
      }
    }
    window.addEventListener("click", handleTextColorPopover);
    return () => window.removeEventListener("click", handleTextColorPopover);
  }, []);

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
      aria-label="Text Color"
      style={isPopover ? { backgroundColor: "#eee" } : {}}
      onClick={applyPreviewTextColorToSelection}
    >
      <div className={"text-setting text-color"}>
        <span style={{ fontWeight: "500", fontSize: "15px" }}>A</span>
        <div ref={previewBoxRef} className={"color-preview"} />
      </div>

      <div className={"text-setting-popover-button text-color"} />

      <FadeAnimate className={"text-color-popover"} isVisible={isPopover}>
        {textColors.map((c, i) => {
          return (
            <div
              key={`text_color_${i}`}
              className={`color-preview-box`}
              onClick={() => updateTextColor(c)}
            >
              <div className={`color-preview-box-el`} style={{ backgroundColor: c }} />
            </div>
          );
        })}
      </FadeAnimate>
    </button>
  );
}
