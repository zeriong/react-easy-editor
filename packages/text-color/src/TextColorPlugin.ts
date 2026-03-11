import type { PluginConfig } from "@react-easy-editor/core";
import { createFontColorToolbarItem } from "./FontColorToolbarItem";
import { createBgColorToolbarItem } from "./BgColorToolbarItem";

import type { FontColorToolbarItemOptions } from "./FontColorToolbarItem";
import type { BgColorToolbarItemOptions } from "./BgColorToolbarItem";

export interface TextColorPluginOptions {
  fontColor?: FontColorToolbarItemOptions;
  bgColor?: BgColorToolbarItemOptions;
}

export function TextColorPlugin(options: TextColorPluginOptions = {}): PluginConfig {
  return {
    name: "text-color",
    toolbar: [
      {
        group: "block",
        priority: 2,
        render: createFontColorToolbarItem(options.fontColor),
      },
      {
        group: "block",
        priority: 3,
        render: createBgColorToolbarItem(options.bgColor),
      },
    ],
  };
}
