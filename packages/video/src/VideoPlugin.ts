import type { PluginConfig } from "@react-easy-editor/core";
import { VideoNode } from "./VideoNode";
import { InsertVideoToolbarItem } from "./InsertVideoToolbarItem";
import { VideoPluginComponent } from "./VideoPluginComponent";

/**
 * VideoPlugin — factory function that returns a PluginConfig
 * providing video upload and resize functionality
 * to the react-easy-editor.
 */
export function VideoPlugin(): PluginConfig {
  return {
    name: "video",
    nodes: [VideoNode],
    toolbar: {
      group: "media",
      priority: 2,
      render: InsertVideoToolbarItem,
    },
    component: VideoPluginComponent as any,
  };
}
