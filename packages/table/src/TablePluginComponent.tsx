import { useEffect } from "react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { INSERT_TABLE_COMMAND } from "@lexical/table";

import { PasteTableHandler } from "./PasteTableHandler";
import { StyledTableNode } from "./nodes/StyledTableNode";
import { StyledTableRowNode } from "./nodes/StyledTableRowNode";
import { StyledTableCellNode } from "./nodes/StyledTableCellNode";

import type { LexicalEditor } from "lexical";
import type { InsertTableCommandPayload } from "@lexical/table";

/* ------------------------------------------------------------------ */
/*  TablePluginComponent                                               */
/*  Registers the INSERT_TABLE_COMMAND and handles table paste from    */
/*  clipboard. Creates StyledTable nodes directly (not via vanilla     */
/*  $createTableNodeWithDimensions) to match direct registration.      */
/* ------------------------------------------------------------------ */

export function TablePluginComponent({ editor }: { editor: LexicalEditor }) {
  /* ---- INSERT_TABLE_COMMAND handler ---- */

  useEffect(() => {
    const removeInsertTable = editor.registerCommand<InsertTableCommandPayload>(
      INSERT_TABLE_COMMAND,
      (payload) => {
        const { rows, columns, includeHeaders } = payload;

        editor.update(() => {
          const tableNode = $createStyledTable(
            Number(rows),
            Number(columns),
            !!includeHeaders,
          );

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const focusNode = selection.focus.getNode();
            focusNode.getTopLevelElementOrThrow().insertAfter(tableNode);
          } else {
            const root = $getRoot();
            root.append(tableNode);
          }

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

  return <PasteTableHandler editor={editor} />;
}

/* ------------------------------------------------------------------ */
/*  Helper: create a StyledTable with given dimensions                  */
/* ------------------------------------------------------------------ */

function $createStyledTable(
  rows: number,
  columns: number,
  includeHeaders: boolean,
): StyledTableNode {
  const tableNode = new StyledTableNode(
    "border-collapse: collapse; table-layout: fixed; width: 100%",
  );

  for (let r = 0; r < rows; r++) {
    const isHeader = includeHeaders && r === 0;
    const rowNode = new StyledTableRowNode();

    for (let c = 0; c < columns; c++) {
      const cellNode = new StyledTableCellNode(isHeader, 1, 1, "");
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(""));
      cellNode.append(paragraph);
      rowNode.append(cellNode);
    }

    tableNode.append(rowNode);
  }

  return tableNode;
}
