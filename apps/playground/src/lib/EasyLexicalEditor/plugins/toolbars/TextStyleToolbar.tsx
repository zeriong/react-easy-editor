import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { TEXT_STYLE_OBJECT } from "../../constants/common.ts";

import type { LexicalEditor, TextFormatType } from "lexical";

export default function TextStyleToolbar({ editor }: { editor: LexicalEditor }) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const typeList = Object.entries(TEXT_STYLE_OBJECT);

  const textStyleEditor = useCallback((_selection: { hasFormat: (type: string) => boolean }, typeStr: string, currentStyle: string) => {
    const currentTextStyle = TEXT_STYLE_OBJECT[typeStr];
    if (_selection.hasFormat(typeStr)) {
      if (!currentStyle.includes(currentTextStyle.style)) {
        currentStyle += `${currentTextStyle.style};`;
      }
    } else {
      currentStyle = currentStyle.replace(currentTextStyle.regexp, "");
    }
  }, []);

  const updateToolbar = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const hasBold = selection.hasFormat("bold");
        const hasItalic = selection.hasFormat("italic");
        const hasUnderline = selection.hasFormat("underline");
        const hasStrikethrough = selection.hasFormat("strikethrough");

        setIsBold(hasBold);
        setIsItalic(hasItalic);
        setIsUnderline(hasUnderline);
        setIsStrikethrough(hasStrikethrough);

        const isCollapsed = selection.isCollapsed();
        if (!isCollapsed) {
          const nodes = selection.getNodes();
          nodes.forEach((node) => {
            if ($isTextNode(node)) {
              let currentStyle = node.getStyle() || "";

              typeList.forEach(([key]) => {
                textStyleEditor(selection, key, currentStyle);
              });

              node.setStyle(currentStyle.trim());
            }
          });
        }
      }
    });
  }, [editor]);

  const setTextStyle = useCallback(
    (textStyle: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, textStyle);
    },
    [],
  );

  useEffect(() => {
    const removeTextStyle = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeTextStyle();
    };
  }, [editor]);

  return (
    <>
      <button
        onClick={() => setTextStyle("bold")}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Bold (Ctrl + B)"
      >
        <i className="format bold" />
      </button>
      <button
        onClick={() => setTextStyle("italic")}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Italic (Ctrl + I)"
      >
        <i className="format italic" />
      </button>
      <button
        onClick={() => setTextStyle("underline")}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Underline (Ctrl + U)"
      >
        <i className="format underline" />
      </button>
      <button
        onClick={() => setTextStyle("strikethrough")}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Strikethrough"
      >
        <i className="format strikethrough" />
      </button>
    </>
  );
}
