import { $createParagraphNode, $getNodeByKey } from "lexical";

import type { LexicalNode } from "lexical";

interface ButtonOption {
  label: string;
  clickFunction: (ctx: { tableKey: string; rowIndex: number; colIndex: number }) => void;
}

export function ensureOverlayEditToolbar(root: HTMLElement): {
  overlay: HTMLElement;
  toolbar: HTMLElement;
  buttonOptions: ButtonOption[];
} | undefined {
  if (!root) return;
  let overlay = root.querySelector<HTMLElement>(":scope > .lex-table-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "lex-table-overlay";
    root.appendChild(overlay);
  }

  const removeTableSafely = (tableNode: LexicalNode) => {
    if (!tableNode) return;
    const p = $createParagraphNode();
    try {
      tableNode.insertAfter(p);
    } catch {
      const parent = tableNode.getParent?.();
      if (parent && "append" in parent) (parent as unknown as { append: (n: LexicalNode) => void }).append(p);
    }
    try {
      (p as unknown as { select?: () => void }).select?.();
    } catch (e) {
      console.log("error: ", e);
    }
    tableNode.remove();
  };

  function createNewCell(cellRef: Record<string, unknown>) {
    const st = (cellRef?.__style as string) || "";
    const col = (cellRef?.__colSpan as number) || 1;
    const row = (cellRef?.__rowSpan as number) || 1;
    const CellKlass = cellRef?.constructor as new (isHeader: boolean, colSpan: number, rowSpan: number, style: string) => unknown;
    return new CellKlass(false, col, row, st) as LexicalNode;
  }

  const buttonOptions: ButtonOption[] = [
    {
      label: "표삭제",
      clickFunction: ({ tableKey }) => {
        const table = $getNodeByKey(tableKey);
        if (table && (table as unknown as { getType?: () => string }).getType?.() === "table") {
          removeTableSafely(table);
        }
      },
    },
    {
      label: "이전에 행 삽입",
      clickFunction: ({ tableKey, rowIndex }) => {
        const table = $getNodeByKey(tableKey);
        const rows = (table as unknown as { getChildren?: () => LexicalNode[] })?.getChildren?.() || [];
        if (!table || rowIndex < 0 || rowIndex >= rows.length) return;

        const refRow = rows[rowIndex];
        const cols = ((refRow as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || []).length;
        const RowKlass = refRow.constructor as new (height: undefined, style: string) => LexicalNode & { append: (n: LexicalNode) => void };
        const newRow = new RowKlass(undefined, ((refRow as Record<string, unknown>).__style as string) || "");

        for (let c = 0; c < Math.max(1, cols); c++) {
          const children = (refRow as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || [];
          const refCell = children[c] || children[0];
          const newCell = createNewCell(refCell as unknown as Record<string, unknown>);
          newRow.append(newCell);
        }
        refRow.insertBefore(newRow);
      },
    },
    {
      label: "다음에 행 삽입",
      clickFunction: ({ tableKey, rowIndex }) => {
        const table = $getNodeByKey(tableKey);
        const rows = (table as unknown as { getChildren?: () => LexicalNode[] })?.getChildren?.() || [];
        if (!table || rowIndex < 0 || rowIndex >= rows.length) return;

        const refRow = rows[rowIndex];
        const cols = ((refRow as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || []).length;
        const RowKlass = refRow.constructor as new (height: undefined, style: string) => LexicalNode & { append: (n: LexicalNode) => void };
        const newRow = new RowKlass(undefined, ((refRow as Record<string, unknown>).__style as string) || "");

        for (let c = 0; c < Math.max(1, cols); c++) {
          const children = (refRow as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || [];
          const refCell = children[c] || children[0];
          const newCell = createNewCell(refCell as unknown as Record<string, unknown>);
          newRow.append(newCell);
        }
        refRow.insertAfter(newRow);
      },
    },
    {
      label: "행 삭제",
      clickFunction: ({ tableKey, rowIndex }) => {
        const table = $getNodeByKey(tableKey);
        const rows = (table as unknown as { getChildren?: () => LexicalNode[] })?.getChildren?.() || [];
        if (!table || rowIndex < 0 || rowIndex >= rows.length) return;

        if (rows.length <= 1) {
          removeTableSafely(table);
          return;
        }
        const row = rows[rowIndex];
        row?.remove();
      },
    },
    {
      label: "이전에 열 삽입",
      clickFunction: ({ tableKey, colIndex }) => {
        const table = $getNodeByKey(tableKey);
        const rows = (table as unknown as { getChildren?: () => LexicalNode[] })?.getChildren?.() || [];
        if (!table || colIndex < 0) return;

        rows.forEach((row) => {
          const cells = (row as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || [];
          const ref = cells[colIndex] || cells[cells.length - 1];
          if (!ref) return;
          const newCell = createNewCell(ref as unknown as Record<string, unknown>);
          ref.insertBefore(newCell);
        });
      },
    },
    {
      label: "다음에 열 삽입",
      clickFunction: ({ tableKey, colIndex }) => {
        const table = $getNodeByKey(tableKey);
        const rows = (table as unknown as { getChildren?: () => LexicalNode[] })?.getChildren?.() || [];
        if (!table || colIndex < 0) return;

        rows.forEach((row) => {
          const cells = (row as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || [];
          const ref = cells[colIndex] || cells[cells.length - 1];
          if (!ref) return;
          const newCell = createNewCell(ref as unknown as Record<string, unknown>);
          ref.insertAfter(newCell);
        });
      },
    },
    {
      label: "열 삭제",
      clickFunction: ({ tableKey, colIndex }) => {
        const table = $getNodeByKey(tableKey);
        const rows = (table as unknown as { getChildren?: () => LexicalNode[] })?.getChildren?.() || [];
        if (!table || colIndex < 0) return;

        const onlyOneColEveryRow = rows.every((row) => ((row as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || []).length <= 1);
        if (onlyOneColEveryRow) {
          removeTableSafely(table);
          return;
        }

        rows.forEach((row) => {
          const cells = (row as unknown as { getChildren?: () => LexicalNode[] }).getChildren?.() || [];
          const idx = Math.min(colIndex, Math.max(0, cells.length - 1));
          const ref = cells[idx];
          if (ref) ref.remove();
        });
      },
    },
  ];

  const containerEl = root.parentNode!.parentNode! as HTMLElement;
  let host = containerEl.querySelector<HTMLElement>(":scope > .lex-table-edit-toolbar-wrapper");
  if (!host) {
    host = document.createElement("div");
    host.className = "lex-table-edit-toolbar-wrapper";
    const headToolbarEl = containerEl.querySelector(".toolbar");
    const toolbarHeight = headToolbarEl?.getBoundingClientRect().height;
    host.style.top = `${(toolbarHeight || 0) + 15}px`;
    containerEl.append(host);
  }

  let toolbar = host.querySelector<HTMLElement>(":scope > .lex-table-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "lex-table-edit-toolbar";

    const mkBtn = ({ label }: { label: string }) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.className = "lex-table-edit-toolbar-button";
      button.onmousedown = (ev) => ev.preventDefault();
      return button;
    };
    buttonOptions.forEach((opt) => toolbar!.appendChild(mkBtn(opt)));
    host.appendChild(toolbar);
  }

  return { overlay, toolbar, buttonOptions };
}
