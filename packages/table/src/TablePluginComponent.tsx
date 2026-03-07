import { useEffect } from "react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import {
  INSERT_TABLE_COMMAND,
  $createTableNodeWithDimensions,
  TableNode,
} from "@lexical/table";
import { TablePlugin as LexicalTablePlugin } from "@lexical/react/LexicalTablePlugin";

import type { LexicalEditor } from "lexical";
import type { InsertTableCommandPayload } from "@lexical/table";

/* ------------------------------------------------------------------ */
/*  TablePluginComponent                                               */
/*  Renders Lexical's built-in TablePlugin and registers the           */
/*  INSERT_TABLE_COMMAND to handle table insertion from toolbar.        */
/* ------------------------------------------------------------------ */

export function TablePluginComponent({ editor }: { editor: LexicalEditor }) {
  /* ---- INSERT_TABLE_COMMAND handler ---- */

  useEffect(() => {
    const removeInsertTable = editor.registerCommand<InsertTableCommandPayload>(
      INSERT_TABLE_COMMAND,
      (payload) => {
        const { rows, columns, includeHeaders } = payload;

        editor.update(() => {
          const tableNode = $createTableNodeWithDimensions(
            Number(rows),
            Number(columns),
            includeHeaders,
          );

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const focusNode = selection.focus.getNode();
            focusNode.getTopLevelElementOrThrow().insertAfter(tableNode);
          } else {
            const root = editor.getEditorState()._nodeMap.get("root");
            if (root) {
              // fallback: append at end
              const paragraph = $createParagraphNode();
              paragraph.insertAfter(tableNode);
            }
          }

          // Insert an empty paragraph after the table for continued typing
          const emptyParagraph = $createParagraphNode();
          tableNode.insertAfter(emptyParagraph);
          emptyParagraph.selectEnd();
        });

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return removeInsertTable;
  }, [editor]);

  /* ---- Render Lexical's built-in table support ---- */

  return (
    <LexicalTablePlugin
      hasCellMerge={true}
      hasCellBackgroundColor={true}
      hasTabHandler={true}
    />
  );
}
