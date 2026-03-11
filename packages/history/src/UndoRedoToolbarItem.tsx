import { useEffect, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useEditorLocale, ArrowCounterclockwiseIcon, ArrowClockwiseIcon } from "@react-easy-editor/core";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

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
      COMMAND_PRIORITY_LOW,
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
      <ArrowCounterclockwiseIcon />
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
      COMMAND_PRIORITY_LOW,
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
      <ArrowClockwiseIcon />
    </button>
  );
}
