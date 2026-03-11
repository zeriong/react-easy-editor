import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEditorLocale, TypeBoldIcon, TypeItalicIcon, TypeUnderlineIcon, TypeStrikethroughIcon } from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { TextFormatType } from "lexical";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Shared hook: track whether a given text format is active           */
/* ------------------------------------------------------------------ */

function useTextFormatActive(
  editor: ToolbarRenderProps["editor"],
  format: TextFormatType,
): boolean {
  const [isActive, setIsActive] = useState(false);

  const updateState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsActive(selection.hasFormat(format));
      }
    });
  }, [editor, format]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateState();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateState]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsActive(selection.hasFormat(format));
        }
      });
    });
  }, [editor, format]);

  return isActive;
}

/* ------------------------------------------------------------------ */
/*  Toolbar render functions                                           */
/* ------------------------------------------------------------------ */

export function BoldToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const isBold = useTextFormatActive(editor, "bold");
  const { t } = useEditorLocale();

  return (
    <button
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      className={"toolbar-item spaced " + (isBold ? "active" : "")}
      aria-label={t("Bold (Ctrl + B)")}
      data-tooltip={t("Bold (Ctrl + B)")}
    >
      <TypeBoldIcon />
    </button>
  );
}

export function ItalicToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const isItalic = useTextFormatActive(editor, "italic");
  const { t } = useEditorLocale();

  return (
    <button
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      className={"toolbar-item spaced " + (isItalic ? "active" : "")}
      aria-label={t("Italic (Ctrl + I)")}
      data-tooltip={t("Italic (Ctrl + I)")}
    >
      <TypeItalicIcon />
    </button>
  );
}

export function UnderlineToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const isUnderline = useTextFormatActive(editor, "underline");
  const { t } = useEditorLocale();

  return (
    <button
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
      aria-label={t("Underline (Ctrl + U)")}
      data-tooltip={t("Underline (Ctrl + U)")}
    >
      <TypeUnderlineIcon />
    </button>
  );
}

export function StrikethroughToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const isStrikethrough = useTextFormatActive(editor, "strikethrough");
  const { t } = useEditorLocale();

  return (
    <button
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
      className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
      aria-label={t("Strikethrough")}
      data-tooltip={t("Strikethrough")}
    >
      <TypeStrikethroughIcon />
    </button>
  );
}
