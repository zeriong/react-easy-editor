// ResizableTablePlugin.tsx
import { useEffect, useRef } from "react";
import { $getNodeByKey, $getSelection, $isRangeSelection } from "lexical";
import { StyledTableCellNode } from "../../nodes/table/StyledTableCellNode.ts";
import { StyledTableRowNode } from "../../nodes/table/StyledTableRowNode.ts";
import { ensureOverlayEditToolbar } from "../../utils/elementCreator/resizableTable.ts";

import type { LexicalEditor } from "lexical";

const EDGE = 6;
const MIN_COL = 40;
const MIN_ROW = 24;
const MIN_TABLE_W = 120;
const MIN_TABLE_H = 60;

const CURSOR_COL = "col-resize";
const CURSOR_ROW = "row-resize";
const CURSOR_NWSE = "nwse-resize";
const CURSOR_NESW = "nesw-resize";

function setStyleProp(styleString: string, prop: string, value: string | null): string {
  const map = new Map<string, string>();
  (styleString || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const i = pair.indexOf(":");
      if (i < 0) return;
      const k = pair.slice(0, i).trim().toLowerCase();
      const v = pair.slice(i + 1).trim();
      map.set(k, v);
    });
  if (value == null) map.delete(prop.toLowerCase());
  else map.set(prop.toLowerCase(), String(value));
  return Array.from(map.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

function getColumnCells(tableEl: HTMLTableElement, colIndex: number): HTMLTableCellElement[] {
  const out: HTMLTableCellElement[] = [];
  const rows = tableEl?.rows || [];
  for (let r = 0; r < rows.length; r++) {
    const cell = rows[r].cells[colIndex];
    if (cell) out.push(cell);
  }
  return out;
}

function getRowCells(tableEl: HTMLTableElement, rowIndex: number): HTMLTableCellElement[] {
  const out: HTMLTableCellElement[] = [];
  const row = tableEl?.rows?.[rowIndex];
  if (!row) return out;
  for (let c = 0; c < row.cells.length; c++) out.push(row.cells[c]);
  return out;
}

function hitEdges(e: PointerEvent, rect: DOMRect): {
  nearLeft: boolean;
  nearRight: boolean;
  nearTop: boolean;
  nearBottom: boolean;
} {
  const nearLeft = Math.abs(e.clientX - rect.left) <= EDGE;
  const nearRight = Math.abs(rect.right - e.clientX) <= EDGE;
  const nearTop = Math.abs(e.clientY - rect.top) <= EDGE;
  const nearBottom = Math.abs(rect.bottom - e.clientY) <= EDGE;
  return { nearLeft, nearRight, nearTop, nearBottom };
}

function scaleWithClamp(values: number[], scale: number, min: number, targetTotal: number): number[] {
  const scaled = values.map((v) => Math.max(min, Math.round(v * scale)));
  const sum = scaled.reduce((a, b) => a + b, 0);
  const diff = targetTotal - sum;
  if (scaled.length > 0) {
    const last = Math.max(min, scaled[scaled.length - 1] + diff);
    scaled[scaled.length - 1] = last;
  }
  return scaled;
}

function positionOverlay(root: HTMLElement, overlay: HTMLElement, tableEl: HTMLTableElement | null): void {
  if (!tableEl) {
    overlay.style.display = "none";
    return;
  }
  const rootRect = root.getBoundingClientRect();
  const rect = tableEl.getBoundingClientRect();
  overlay.style.display = "block";
  overlay.style.left = `${rect.left - rootRect.left + root.scrollLeft}px`;
  overlay.style.top = `${rect.top - rootRect.top + root.scrollTop}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.borderColor = "dodgerblue";
}

type DragMode = "col" | "row" | "corner" | "tableX" | "tableY" | "tableXY";

interface DragState {
  active: boolean;
  pointerId: number | null;
  raf: number;
  mode: DragMode | null;
  table: HTMLTableElement | null;
  startX: number;
  startY: number;
  tableInitW: number;
  tableInitH: number;
  allColsByRow: HTMLTableCellElement[][];
  initColWidths: number[];
  initRowHeights: number[];
  colIndex: number;
  colTargets: HTMLTableCellElement[];
  initColW: number[];
  rowIndex: number;
  rowTargets: HTMLTableCellElement[];
  initRowH: number[];
}

interface SelectedState {
  tableKey: string | null;
  rowIndex: number;
  colIndex: number;
}

interface ResizableTablePluginProps {
  editor: LexicalEditor;
}

export default function ResizableTablePlugin({ editor }: ResizableTablePluginProps) {
  const drag = useRef<DragState>({
    active: false,
    pointerId: null,
    raf: 0,
    mode: null,
    table: null,
    startX: 0,
    startY: 0,
    tableInitW: 0,
    tableInitH: 0,
    allColsByRow: [],
    initColWidths: [],
    initRowHeights: [],
    colIndex: -1,
    colTargets: [],
    initColW: [],
    rowIndex: -1,
    rowTargets: [],
    initRowH: [],
  });

  const selected = useRef<SelectedState>({ tableKey: null, rowIndex: -1, colIndex: -1 });

  useEffect(() => {
    let root: HTMLElement | null = editor.getRootElement();
    if (!root) return;

    const result = ensureOverlayEditToolbar(root);
    if (!result) return;
    const { overlay, toolbar, buttonOptions } = result;

    const withCtx = (fn: (ctx: { tableKey: string; rowIndex: number; colIndex: number }) => void) =>
      (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const { tableKey, rowIndex, colIndex } = selected.current;
        if (!tableKey) return;
        editor.update(() => fn({ tableKey, rowIndex, colIndex }));
      };

    Array.from(toolbar.querySelectorAll("button")).forEach((button) => {
      const findTarget = buttonOptions.find((opt) => opt.label === button.textContent);
      if (findTarget) {
        button.onclick = withCtx(findTarget.clickFunction);
      }
    });

    root.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const removeUpdate = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        let tableKey: string | null = null;
        let rowIndex = -1;
        let colIndex = -1;

        if ($isRangeSelection(sel)) {
          let node = sel.anchor.getNode();
          while (node && node.getType && node.getType() !== "tableCell") {
            node = node.getParent && node.getParent()!;
          }
          if (node && node.getType?.() === "tableCell") {
            const row = node.getParent();
            const table = row?.getParent();
            if (table && table.getType?.() === "table") {
              tableKey = table.getKey();
              const rows = table.getChildren();
              rowIndex = rows.findIndex((r) => r.getKey() === row!.getKey());
              const cells = row!.getChildren();
              colIndex = cells.findIndex((c) => c.getKey() === node.getKey());
            }
          }
        }

        selected.current = { tableKey, rowIndex, colIndex };
        toolbar.style.display = tableKey ? "flex" : "none";
        positionOverlay(root!, overlay, tableKey ? editor.getElementByKey(tableKey) as HTMLTableElement | null : null);
      });
    });

    function onScrollOrResize() {
      const tableEl = selected.current.tableKey
        ? editor.getElementByKey(selected.current.tableKey)
        : null;
      positionOverlay(root!, overlay, tableEl as HTMLTableElement | null);
    }

    const onPointerMovePreview = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) {
        if (!drag.current.active) document.body.style.cursor = "";
        return;
      }
      let cursor = "";
      if (t.tagName === "TD" || t.tagName === "TH") {
        const rect = t.getBoundingClientRect();
        const { nearLeft, nearRight, nearTop, nearBottom } = hitEdges(e, rect);
        if ((nearLeft && nearTop) || (nearRight && nearBottom)) cursor = CURSOR_NWSE;
        else if ((nearRight && nearTop) || (nearLeft && nearBottom)) cursor = CURSOR_NESW;
        else if (nearLeft || nearRight) cursor = CURSOR_COL;
        else if (nearTop || nearBottom) cursor = CURSOR_ROW;
      }
      const table = t.closest("table");
      if (table) {
        const tr = table.getBoundingClientRect().right;
        const tb = table.getBoundingClientRect().bottom;
        const nearTR = Math.abs(tr - e.clientX) <= EDGE;
        const nearTB = Math.abs(tb - e.clientY) <= EDGE;
        if (nearTR && nearTB) cursor = CURSOR_NWSE;
        else if (nearTR) cursor = CURSOR_COL;
        else if (nearTB) cursor = CURSOR_ROW;
      }
      if (!drag.current.active) document.body.style.cursor = cursor || "";
    };

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.tagName !== "TD" && t.tagName !== "TH") return;

      const table = t.closest("table") as HTMLTableElement | null;
      if (!table) return;

      table.style.tableLayout = "fixed";
      table.style.borderCollapse = "collapse";

      const cellRect = t.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const { nearLeft, nearRight, nearTop, nearBottom } = hitEdges(e, cellRect);

      const isLastRow = t.parentElement && (t.parentElement as HTMLTableRowElement).rowIndex === table.rows.length - 1;
      const isLastCol = (t as HTMLTableCellElement).cellIndex === ((t.parentElement as HTMLTableRowElement)?.cells.length || 1) - 1;
      const nearTR = Math.abs(tableRect.right - e.clientX) <= EDGE;
      const nearTB = Math.abs(tableRect.bottom - e.clientY) <= EDGE;

      let mode: DragMode | null = null;
      if (isLastCol && nearRight && nearTR && isLastRow && nearBottom && nearTB) mode = "tableXY";
      else if (isLastCol && nearRight && nearTR) mode = "tableX";
      else if (isLastRow && nearBottom && nearTB) mode = "tableY";
      else if ((nearLeft && nearTop) || (nearRight && nearBottom)) mode = "corner";
      else if (nearLeft || nearRight) mode = "col";
      else if (nearTop || nearBottom) mode = "row";
      else return;

      const rows = Array.from(table.rows);
      const colsCount = rows[0]?.cells?.length || 0;

      const initColWidths = new Array<number>(colsCount).fill(0);
      rows.forEach((row) => {
        const cells = Array.from(row.cells);
        cells.forEach((cell, c) => {
          initColWidths[c] += cell.getBoundingClientRect().width;
        });
      });
      for (let c = 0; c < colsCount; c++)
        initColWidths[c] = Math.round(initColWidths[c] / rows.length);

      const initRowHeights = rows.map((row) => Math.round(row.getBoundingClientRect().height));

      const allColsByRow = rows.map((row) => Array.from(row.cells));

      drag.current.active = true;
      drag.current.pointerId = e.pointerId;
      drag.current.mode = mode;
      drag.current.table = table;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.tableInitW = tableRect.width;
      drag.current.tableInitH = tableRect.height;

      drag.current.allColsByRow = allColsByRow;
      drag.current.initColWidths = initColWidths;
      drag.current.initRowHeights = initRowHeights;

      const targetCol = nearLeft ? Math.max(0, (t as HTMLTableCellElement).cellIndex - 1) : (t as HTMLTableCellElement).cellIndex;
      drag.current.colIndex = targetCol;
      drag.current.colTargets = getColumnCells(table, targetCol);
      drag.current.initColW = drag.current.colTargets.map(
        (cell) => cell.getBoundingClientRect().width,
      );

      const rowIndex = nearTop
        ? Math.max(0, ((t.parentElement as HTMLTableRowElement)?.rowIndex ?? 0) - 1)
        : ((t.parentElement as HTMLTableRowElement)?.rowIndex ?? -1);
      drag.current.rowIndex = rowIndex < 0 ? 0 : rowIndex;
      drag.current.rowTargets = getRowCells(table, drag.current.rowIndex);
      drag.current.initRowH = drag.current.rowTargets.map(
        (cell) => cell.getBoundingClientRect().height,
      );

      document.body.style.userSelect = "none";
      try {
        t.setPointerCapture?.(e.pointerId);
      } catch (error) {
        console.log("error: ", error);
      }
      document.body.style.cursor =
        mode === "tableXY" || mode === "corner"
          ? CURSOR_NWSE
          : mode === "tableX" || mode === "col"
            ? CURSOR_COL
            : CURSOR_ROW;

      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.active || drag.current.pointerId !== e.pointerId) return;
      if (drag.current.raf) cancelAnimationFrame(drag.current.raf);

      drag.current.raf = requestAnimationFrame(() => {
        const dx = e.clientX - drag.current.startX;
        const dy = e.clientY - drag.current.startY;
        const mode = drag.current.mode;

        /* ===== Table-wide resize: scale columns/rows proportionally ===== */
        if (mode === "tableX" || mode === "tableY" || mode === "tableXY") {
          const newW =
            mode === "tableY"
              ? drag.current.tableInitW
              : Math.max(MIN_TABLE_W, Math.round(drag.current.tableInitW + dx));
          const newH =
            mode === "tableX"
              ? drag.current.tableInitH
              : Math.max(MIN_TABLE_H, Math.round(drag.current.tableInitH + dy));

          const scaleX = newW / drag.current.tableInitW;
          const scaleY = newH / drag.current.tableInitH;

          const colWidths = scaleWithClamp(drag.current.initColWidths, scaleX, MIN_COL, newW);

          const rowHeights = scaleWithClamp(drag.current.initRowHeights, scaleY, MIN_ROW, newH);

          drag.current.table!.style.width = `${newW}px`;
          drag.current.table!.style.height = `${newH}px`;
          drag.current.table!.style.minWidth = "";
          drag.current.table!.style.minHeight = "";

          for (let c = 0; c < colWidths.length; c++) {
            const w = colWidths[c];
            for (let r = 0; r < drag.current.allColsByRow.length; r++) {
              const cell = drag.current.allColsByRow[r][c];
              if (!cell) continue;
              cell.style.width = `${w}px`;
              cell.style.minWidth = "";
            }
          }

          const tableRows = drag.current.table!.rows;
          for (let r = 0; r < rowHeights.length; r++) {
            const h = rowHeights[r];
            const tr = tableRows[r];
            if (tr) {
              tr.style.height = `${h}px`;
              tr.style.minHeight = "";
              const cells = tr.cells;
              for (let c = 0; c < cells.length; c++) {
                const cell = cells[c];
                cell.style.height = `${h}px`;
                cell.style.minHeight = "";
              }
            }
          }
        }

        /* ===== Single column/row/corner resize ===== */
        if (mode === "col" || mode === "corner") {
          const wList = drag.current.initColW.map((w0) => Math.max(MIN_COL, Math.round(w0 + dx)));
          drag.current.colTargets.forEach((cell, i) => {
            const w = wList[i];
            cell.style.width = `${w}px`;
            cell.style.minWidth = "";
          });
        }
        if (mode === "row" || mode === "corner") {
          const hList = drag.current.initRowH.map((h0) => Math.max(MIN_ROW, Math.round(h0 + dy)));
          drag.current.rowTargets.forEach((cell, i) => {
            const h = hList[i];
            cell.style.height = `${h}px`;
            cell.style.minHeight = "";
            const tr = cell.parentElement;
            if (tr) {
              (tr as HTMLElement).style.height = `${h}px`;
              (tr as HTMLElement).style.minHeight = "";
            }
          });
        }

        const { tableKey } = selected.current;
        if (tableKey) {
          const tableEl = editor.getElementByKey(tableKey);
          if (tableEl === drag.current.table) {
            positionOverlay(root!, overlay, drag.current.table);
          }
        }
      });
    };

    const commitAndReset = () => {
      if (!drag.current.active) return;
      if (drag.current.raf) cancelAnimationFrame(drag.current.raf);

      editor.update(
        () => {
          const tableKey = drag.current.table?.getAttribute("data-lexical-node-key");
          if (!tableKey) return;

          const tableNode = $getNodeByKey(tableKey);
          if (!tableNode) return;

          const rectTable = drag.current.table!.getBoundingClientRect();
          if (tableNode.getType?.() === "table" && typeof (tableNode as any).getStyle === "function") {
            let tStyle: string = (tableNode as any).getStyle() || "";
            tStyle = setStyleProp(
              tStyle,
              "width",
              `${Math.max(MIN_TABLE_W, Math.round(rectTable.width))}px`,
            );
            tStyle = setStyleProp(
              tStyle,
              "height",
              `${Math.max(MIN_TABLE_H, Math.round(rectTable.height))}px`,
            );
            tStyle = setStyleProp(tStyle, "table-layout", "fixed");
            (tableNode as any).setStyle(tStyle);
          }

          const rows = Array.from(drag.current.table!.rows);
          const colsCount = rows[0]?.cells?.length || 0;
          for (let c = 0; c < colsCount; c++) {
            for (let r = 0; r < rows.length; r++) {
              const cellEl = rows[r].cells[c];
              const key = cellEl?.getAttribute("data-lexical-node-key");
              if (!key) continue;
              const node = $getNodeByKey(key);
              if (!(node instanceof StyledTableCellNode)) continue;
              const rect = cellEl.getBoundingClientRect();
              let s = node.getStyle() || "";
              s = setStyleProp(s, "width", `${Math.max(MIN_COL, Math.round(rect.width))}px`);
              node.setStyle(s);
            }
          }

          for (let r = 0; r < rows.length; r++) {
            const tr = rows[r];
            const rowRect = tr.getBoundingClientRect();
            const rowH = Math.max(MIN_ROW, Math.round(rowRect.height));

            const rowKey = tr.getAttribute("data-lexical-node-key");
            if (rowKey) {
              const rowNode = $getNodeByKey(rowKey);
              if (rowNode instanceof StyledTableRowNode) {
                let rs = rowNode.getStyle() || "";
                rs = setStyleProp(rs, "height", `${rowH}px`);
                rowNode.setStyle(rs);
              }
            }

            const cells = tr.cells;
            for (let c = 0; c < cells.length; c++) {
              const cellEl = cells[c];
              const key = cellEl?.getAttribute("data-lexical-node-key");
              if (!key) continue;
              const node = $getNodeByKey(key);
              if (!(node instanceof StyledTableCellNode)) continue;
              const rect = cellEl.getBoundingClientRect();
              const h = Math.max(MIN_ROW, Math.round(rect.height));
              let cs = node.getStyle() || "";
              cs = setStyleProp(cs, "height", `${h}px`);
              node.setStyle(cs);
            }
          }
        },
        { discrete: true },
      );

      drag.current = {
        active: false,
        pointerId: null,
        raf: 0,
        mode: null,
        table: null,
        startX: 0,
        startY: 0,
        tableInitW: 0,
        tableInitH: 0,
        allColsByRow: [],
        initColWidths: [],
        initRowHeights: [],
        colIndex: -1,
        colTargets: [],
        initColW: [],
        rowIndex: -1,
        rowTargets: [],
        initRowH: [],
      };
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      const tableEl = selected.current.tableKey
        ? editor.getElementByKey(selected.current.tableKey)
        : null;
      positionOverlay(root!, overlay, tableEl as HTMLTableElement | null);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (drag.current.pointerId === e.pointerId) commitAndReset();
    };
    const onPointerCancel = (e: PointerEvent) => {
      if (drag.current.pointerId === e.pointerId) commitAndReset();
    };
    const onLostCapture = () => commitAndReset();
    const onWindowBlur = () => commitAndReset();
    const onVisibility = () => {
      if (document.hidden) commitAndReset();
    };

    root.addEventListener("pointermove", onPointerMovePreview);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("lostpointercapture", onLostCapture);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("visibilitychange", onVisibility);

    const unlistenRoot = editor.registerRootListener((next: HTMLElement | null, prev: HTMLElement | null) => {
      if (prev) {
        prev.removeEventListener("pointermove", onPointerMovePreview);
        prev.removeEventListener("pointerdown", onPointerDown);
        prev.removeEventListener("lostpointercapture", onLostCapture);
      }
      if (next) {
        next.addEventListener("pointermove", onPointerMovePreview);
        next.addEventListener("pointerdown", onPointerDown);
        next.addEventListener("lostpointercapture", onLostCapture);
      }
      root = next || null;
    });

    return () => {
      removeUpdate();
      root && root.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);

      if (root) {
        root.removeEventListener("pointermove", onPointerMovePreview);
        root.removeEventListener("pointerdown", onPointerDown);
        root.removeEventListener("lostpointercapture", onLostCapture);
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      unlistenRoot();

      drag.current.active = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
    };
  }, [editor]);

  return null;
}
