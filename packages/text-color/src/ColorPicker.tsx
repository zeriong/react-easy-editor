import { PopoverBox } from "@react-easy-editor/core";

import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Default color palette                                              */
/* ------------------------------------------------------------------ */

export const DEFAULT_TEXT_COLORS: string[] = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130",
];

export const DEFAULT_BG_COLORS: string[] = [
  "transparent",
  "#fce4ec", "#fff3e0", "#fffde7", "#e8f5e9", "#e0f7fa", "#e3f2fd", "#ede7f6", "#fce4ec",
  "#ef9a9a", "#ffcc80", "#fff59d", "#a5d6a7", "#80deea", "#90caf9", "#b39ddb", "#f48fb1",
  "#e57373", "#ffb74d", "#fff176", "#81c784", "#4dd0e1", "#64b5f6", "#9575cd", "#f06292",
  "#ef5350", "#ffa726", "#ffee58", "#66bb6a", "#26c6da", "#42a5f5", "#7e57c2", "#ec407a",
  "#f44336", "#ff9800", "#ffeb3b", "#4caf50", "#00bcd4", "#2196f3", "#673ab7", "#e91e63",
  "#d32f2f", "#f57c00", "#fbc02d", "#388e3c", "#0097a7", "#1976d2", "#512da8", "#c2185b",
  "#c62828", "#e65100", "#f9a825", "#2e7d32", "#00838f", "#1565c0", "#4527a0", "#ad1457",
  "#b71c1c", "#bf360c", "#f57f17", "#1b5e20", "#006064", "#0d47a1", "#311b92", "#880e4f",
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
