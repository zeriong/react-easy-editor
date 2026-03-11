import { PopoverBox } from "@react-easy-editor/core";

import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Default color palette                                              */
/* ------------------------------------------------------------------ */

export const DEFAULT_TEXT_COLORS: string[] = [
  "#000000", "#FFFFFF", "#E11D48", "#2563EB", "#059669", "#F59E0B", "#64748B",
];

export const DEFAULT_BG_COLORS: string[] = [
  "transparent", "#FFF1F2", "#DBEAFE", "#ECFDF5", "#FEF3C7", "#F1F5F9",
];

/* ------------------------------------------------------------------ */
/*  ColorPicker component                                              */
/* ------------------------------------------------------------------ */

interface ColorPickerProps {
  colors: string[];
  onSelectColor: (color: string) => void;
  className: string;
}

export function ColorPicker({ colors, onSelectColor, className }: ColorPickerProps): ReactNode {
  return (
    <PopoverBox>
      <div className={className}>
        {colors.map((color, index) => {
          const isTransparent = color === "transparent";
          return (
            <div
              key={`${className}_${index}`}
              className="color-preview-box"
              onClick={() => onSelectColor(color)}
            >
              <div
                className={`color-preview-box-el${isTransparent ? " transparent" : ""}`}
                style={{ backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
    </PopoverBox>
  );
}
