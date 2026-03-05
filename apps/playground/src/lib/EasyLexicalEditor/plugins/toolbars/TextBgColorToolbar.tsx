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

export default function TextBgColorToolbar({ editor, bgColors }: { editor: LexicalEditor; bgColors: string[] }) {
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const [isPopover, setIsPopover] = useState(false);

  const setPreviewColor = useCallback((color: string) => {
    const el = previewBoxRef.current;
    if (!el) return;
    el.style.backgroundColor = color || "transparent";
  }, []);

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

  const updateTextBgColor = useCallback(
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

  function applyPreviewBgToSelection() {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const el = previewBoxRef && previewBoxRef.current;
      if (!el) return;

      let color = el.style.backgroundColor;
      if (!color) {
        const cs = window.getComputedStyle(el);
        color = cs ? cs.backgroundColor : "";
      }
      if (!color) return;

      $patchStyleText(selection, { "background-color": color });
    });
  }

  useEffect(() => {
    function handleTextBgPopover(e: MouseEvent) {
      const cls = (e.target as HTMLElement)?.classList;

      if (cls.contains("text-color-popover")) {
        return;
      }

      if (cls.contains("text-setting-popover-button") && cls.contains("text-bg-color")) {
        setIsPopover(true);
      } else {
        setIsPopover(false);
      }
    }
    window.addEventListener("click", handleTextBgPopover);
    return () => window.removeEventListener("click", handleTextBgPopover);
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
      className="toolbar-item spaced text-bg-color"
      aria-label="Background Color"
      style={isPopover ? { backgroundColor: "#eee" } : {}}
      onClick={applyPreviewBgToSelection}
    >
      <div className={"text-setting bg-color"}>
        <i className={"text-bg-color"} />
        <div ref={previewBoxRef} className={"color-preview"} />
      </div>

      <div className={"text-setting-popover-button text-bg-color"} />

      <FadeAnimate className={"text-bg-color-popover"} isVisible={isPopover}>
        {bgColors.map((c, i) => {
          const isTransparent = c === "transparent";
          return (
            <div
              key={`text_bg_color_${i}`}
              className={`color-preview-box`}
              onClick={() => updateTextBgColor(c)}
            >
              <div
                className={`color-preview-box-el ${isTransparent ? "transparent" : ""}`}
                style={{ backgroundColor: c }}
              />
            </div>
          );
        })}
      </FadeAnimate>
    </button>
  );
}
