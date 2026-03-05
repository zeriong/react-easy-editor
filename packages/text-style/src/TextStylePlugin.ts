import type { PluginConfig } from "@react-easy-editor/core";
import {
  BoldToolbarItem,
  ItalicToolbarItem,
  UnderlineToolbarItem,
  StrikethroughToolbarItem,
} from "./TextStyleToolbarItems";

export function TextStylePlugin(): PluginConfig {
  return {
    name: "text-style",
    toolbar: [
      {
        group: "style",
        priority: 1,
        render: BoldToolbarItem,
      },
      {
        group: "style",
        priority: 2,
        render: ItalicToolbarItem,
      },
      {
        group: "style",
        priority: 3,
        render: UnderlineToolbarItem,
      },
      {
        group: "style",
        priority: 4,
        render: StrikethroughToolbarItem,
      },
    ],
  };
}
