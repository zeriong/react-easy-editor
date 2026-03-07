import { useCallback, useState } from "react";
import { useEditorLocale, PopoverBox } from "@react-easy-editor/core";
import { INSERT_TABLE_COMMAND } from "@lexical/table";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRID_ROWS = 5;
const GRID_COLS = 5;

/* ------------------------------------------------------------------ */
/*  Inline SVG icon (table grid)                                       */
/* ------------------------------------------------------------------ */

function TableIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid Cell Component                                                */
/* ------------------------------------------------------------------ */

interface GridCellProps {
  row: number;
  col: number;
  isHighlighted: boolean;
  onHover: (row: number, col: number) => void;
  onClick: () => void;
}

function GridCell({ isHighlighted, onHover, onClick, row, col }: GridCellProps) {
  return (
    <div
      role="gridcell"
      aria-selected={isHighlighted}
      style={{
        width: 20,
        height: 20,
        border: "1px solid",
        borderColor: isHighlighted ? "#4a90d9" : "#ccc",
        backgroundColor: isHighlighted ? "#d0e4f7" : "#fff",
        cursor: "pointer",
        boxSizing: "border-box",
        transition: "background-color 0.1s, border-color 0.1s",
      }}
      onMouseEnter={() => onHover(row, col)}
      onClick={onClick}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Grid Selector Component                                            */
/* ------------------------------------------------------------------ */

interface GridSelectorProps {
  onSelect: (rows: number, cols: number) => void;
}

function GridSelector({ onSelect }: GridSelectorProps) {
  const [hoverRow, setHoverRow] = useState(-1);
  const [hoverCol, setHoverCol] = useState(-1);

  const handleHover = useCallback((row: number, col: number) => {
    setHoverRow(row);
    setHoverCol(col);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverRow(-1);
    setHoverCol(-1);
  }, []);

  const label =
    hoverRow >= 0 && hoverCol >= 0
      ? `${hoverRow + 1} x ${hoverCol + 1}`
      : "";

  return (
    <div
      onMouseLeave={handleMouseLeave}
      style={{ padding: 8 }}
    >
      <div
        role="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 20px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 20px)`,
          gap: 2,
        }}
      >
        {Array.from({ length: GRID_ROWS }, (_, r) =>
          Array.from({ length: GRID_COLS }, (_, c) => (
            <GridCell
              key={`${r}-${c}`}
              row={r}
              col={c}
              isHighlighted={r <= hoverRow && c <= hoverCol}
              onHover={handleHover}
              onClick={() => onSelect(r + 1, c + 1)}
            />
          )),
        )}
      </div>
      {label && (
        <div
          style={{
            textAlign: "center",
            marginTop: 4,
            fontSize: 12,
            color: "#666",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar render function                                            */
/* ------------------------------------------------------------------ */

export function InsertTableToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useEditorLocale();

  const handleSelect = useCallback(
    (rows: number, cols: number) => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: String(rows),
        columns: String(cols),
        includeHeaders: false,
      });
      setIsOpen(false);
    },
    [editor],
  );

  const togglePopover = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={togglePopover}
        className="toolbar-item spaced"
        aria-label={t("Insert Table")}
        data-tooltip={t("Insert Table")}
      >
        <TableIcon />
      </button>
      {isOpen && (
        <PopoverBox>
          <GridSelector onSelect={handleSelect} />
        </PopoverBox>
      )}
    </div>
  );
}
