import type { PluginConfig } from "@react-easy-editor/core";
import { ImageNode } from "./ImageNode";
import { InsertImageToolbarItem } from "./InsertImageToolbarItem";
import { ImagePluginComponent } from "./ImagePluginComponent";

/**
 * ImagePlugin — factory function that returns a PluginConfig
 * providing image upload, paste, drag-and-drop, and resize
 * functionality to the react-easy-editor.
 */
export function ImagePlugin(): PluginConfig {
  return {
    name: "image",
    nodes: [ImageNode],
    toolbar: {
      group: "media",
      priority: 1,
      render: InsertImageToolbarItem,
    },
    component: ImagePluginComponent as any,
  };
}
