import { useEffect } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import { useEditorContext } from "../EditorContext";

const DEFAULT_CARET_COLOR = "#444";

/**
 * Extracts the `color` value from an inline style string.
 * Returns null if no color property is found.
 */
function extractColorFromStyle(styleStr: string | null): string | null {
  if (!styleStr) return null;
  const match = /(^|;)\s*color\s*:\s*([^;]+)\s*(;|$)/i.exec(styleStr);
  return match ? match[2].trim() : null;
}

/**
 * Retrieves the text color from a Lexical node via its `getStyle()` method.
 * Returns null if the node does not support `getStyle` or has no color set.
 */
function getNodeColor(node: unknown): string | null {
  const styledNode = node as { getStyle?: () => string };
  if (typeof styledNode.getStyle === "function") {
    return extractColorFromStyle(styledNode.getStyle());
  }
  return null;
}

/**
 * CaretColorPlugin - A built-in plugin that synchronizes the editor caret color
 * with the current text color at the cursor position.
 *
 * This ensures visual consistency when the user changes text color - the blinking
 * caret will match the color of the text being typed.
 *
 * This plugin is automatically included in ReactEasyEditor and does not need
 * to be added manually. It is exported for advanced users who may want to use
 * it in custom editor setups.
 */
export function CaretColorPlugin() {
  const { editor } = useEditorContext();

  useEffect(() => {
    const applyCaretColor = () => {
      editor.getEditorState().read(() => {
        const rootEl = editor.getRootElement();
        if (!rootEl) return;

        let caretColor = DEFAULT_CARET_COLOR;
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            // Collapsed selection: get color from anchor node or computed style
            const anchorNode = selection.anchor.getNode();
            const nodeColor = getNodeColor(anchorNode);

            if (nodeColor) {
              caretColor = nodeColor;
            } else {
              // Fallback: read computed color from the DOM anchor element
              const windowSelection = rootEl.ownerDocument.getSelection();
              const anchorDom =
                windowSelection?.anchorNode instanceof Element
                  ? windowSelection.anchorNode
                  : windowSelection?.anchorNode?.parentElement;

              if (anchorDom) {
                const computedStyle = window.getComputedStyle(anchorDom);
                if (computedStyle?.color) {
                  caretColor = computedStyle.color;
                }
              }
            }
          } else {
            // Range selection: get color from the first styled node
            const nodes = selection.getNodes();
            for (const node of nodes) {
              const nodeColor = getNodeColor(node);
              if (nodeColor) {
                caretColor = nodeColor;
                break;
              }
            }
          }
        }

        rootEl.style.caretColor = caretColor;
      });
    };

    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        applyCaretColor();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const removeUpdateListener = editor.registerUpdateListener(() =>
      applyCaretColor(),
    );

    // Apply immediately on mount
    applyCaretColor();

    return () => {
      removeSelectionListener();
      removeUpdateListener();
    };
  }, [editor]);

  return null;
}
