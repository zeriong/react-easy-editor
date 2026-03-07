import type { PluginConfig } from "@react-easy-editor/core";
import { AlignmentToolbarItem } from "./AlignmentToolbarItem";

export function AlignmentPlugin(): PluginConfig {
  return {
    name: "alignment",
    toolbar: {
      group: "align",
      priority: 1,
      render: AlignmentToolbarItem,
    },
  };
}
