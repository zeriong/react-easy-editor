import { useEffect, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useEditorLocale } from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (Bootstrap Icons — arrow-counterclockwise / clockwise) */
/* ------------------------------------------------------------------ */

function UndoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"
      />
      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
      />
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar render functions                                          */
/* ------------------------------------------------------------------ */

export function UndoToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const [canUndo, setCanUndo] = useState(false);
  const { t } = useEditorLocale();

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return (
    <button
      disabled={!canUndo}
      onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      className="toolbar-item spaced"
      aria-label={t("Undo (Ctrl + Z)")}
      data-tooltip={t("Undo (Ctrl + Z)")}
    >
      <UndoIcon />
    </button>
  );
}

export function RedoToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const [canRedo, setCanRedo] = useState(false);
  const { t } = useEditorLocale();

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return (
    <button
      disabled={!canRedo}
      onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      className="toolbar-item"
      aria-label={t("Redo (Ctrl + Y)")}
      data-tooltip={t("Redo (Ctrl + Y)")}
    >
      <RedoIcon />
    </button>
  );
}
