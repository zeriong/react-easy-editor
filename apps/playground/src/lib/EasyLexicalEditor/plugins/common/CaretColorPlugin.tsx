import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import type { LexicalEditor } from "lexical";

function extractColorFromStyle(styleStr: string | null): string | null {
  if (!styleStr) return null;
  const m = /(^|;)\s*color\s*:\s*([^;]+)\s*(;|$)/i.exec(styleStr);
  return m ? m[2].trim() : null;
}

interface CaretColorPluginProps {
  editor: LexicalEditor;
}

export default function CaretColorPlugin({ editor }: CaretColorPluginProps) {
  useEffect(() => {
    const applyCaretColor = () => {
      editor.getEditorState().read(() => {
        const rootEl = editor.getRootElement();
        if (!rootEl) return;

        let caret = "#444";
        const sel = $getSelection();

        if ($isRangeSelection(sel)) {
          if (sel.isCollapsed()) {
            const node = sel.anchor.getNode();
            const fromNode =
              typeof (node as { getStyle?: () => string }).getStyle === "function"
                ? extractColorFromStyle((node as { getStyle?: () => string }).getStyle!())
                : null;
            if (fromNode) {
              caret = fromNode;
            } else {
              const winSel = rootEl.ownerDocument.getSelection();
              const anchorDom =
                winSel?.anchorNode instanceof Element
                  ? winSel.anchorNode
                  : winSel?.anchorNode?.parentElement;
              if (anchorDom) {
                const cs = window.getComputedStyle(anchorDom);
                if (cs?.color) caret = cs.color;
              }
            }
          } else {
            const nodes = sel.getNodes();
            for (const n of nodes) {
              if (typeof (n as { getStyle?: () => string }).getStyle === "function") {
                const c = extractColorFromStyle((n as { getStyle?: () => string }).getStyle!());
                if (c) {
                  caret = c;
                  break;
                }
              }
            }
          }
        }
        rootEl.style.caretColor = caret;
      });
    };

    const removeSel = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        applyCaretColor();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    const removeUpdate = editor.registerUpdateListener(() => applyCaretColor());

    applyCaretColor();

    return () => {
      removeSel();
      removeUpdate();
    };
  }, [editor]);

  return null;
}
