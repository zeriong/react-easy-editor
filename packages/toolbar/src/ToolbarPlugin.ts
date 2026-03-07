import type { PluginConfig } from "@react-easy-editor/core";
import { ToolbarContainer } from "./ToolbarContainer";

export function ToolbarPlugin(): PluginConfig {
  return {
    name: "toolbar",
    component: ToolbarContainer as any,
  };
}
