import { useCallback, useState } from "react";
import { useEditorLocale, PopoverBox, TableIcon } from "@react-easy-editor/core";
import { INSERT_TABLE_COMMAND } from "@lexical/table";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRID_ROWS = 5;
const GRID_COLS = 5;

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
