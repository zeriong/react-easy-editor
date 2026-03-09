import type { PluginConfig } from "@react-easy-editor/core";
import { UndoToolbarItem, RedoToolbarItem } from "./UndoRedoToolbarItem";
import { HistoryPluginComponent } from "./HistoryPluginComponent";

export function HistoryPlugin(): PluginConfig {
  return {
    name: "history",
    toolbar: [
      {
        group: "undo",
        priority: 1,
        render: UndoToolbarItem,
      },
      {
        group: "undo",
        priority: 2,
        render: RedoToolbarItem,
      },
    ],
    component: HistoryPluginComponent,
  };
}
