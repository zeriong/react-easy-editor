import type { PluginConfig } from "@react-easy-editor/core";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { InsertTableToolbarItem } from "./InsertTableToolbarItem";
import { TablePluginComponent } from "./TablePluginComponent";

/**
 * TablePlugin -- factory function that returns a PluginConfig
 * providing table creation, cell merge, resize, and tab navigation
 * functionality to the react-easy-editor.
 */
export function TablePlugin(): PluginConfig {
  return {
    name: "table",
    nodes: [TableNode, TableCellNode, TableRowNode],
    toolbar: {
      group: "media",
      priority: 3,
      render: InsertTableToolbarItem,
    },
    component: TablePluginComponent as any,
  };
}
