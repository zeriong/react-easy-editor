import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEditorLocale } from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { TextFormatType } from "lexical";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (Bootstrap Icons style)                           */
/* ------------------------------------------------------------------ */

function BoldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136z" />
      <path fillRule="evenodd" d="M12.5 15h-9v-1h9v1z" />
    </svg>
  );
}

function StrikethroughIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967z" />
    </svg>
  );
}

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
      <BoldIcon />
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
      <ItalicIcon />
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
      <UnderlineIcon />
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
      <StrikethroughIcon />
    </button>
  );
}
