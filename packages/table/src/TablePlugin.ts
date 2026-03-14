import type { PluginConfig } from "@react-easy-editor/core";

import { InsertTableToolbarItem } from "./InsertTableToolbarItem";
import { TablePluginComponent } from "./TablePluginComponent";
import { StyledTableNode } from "./nodes/StyledTableNode";
import { StyledTableRowNode } from "./nodes/StyledTableRowNode";
import { StyledTableCellNode } from "./nodes/StyledTableCellNode";

/**
 * TablePlugin -- factory function that returns a PluginConfig
 * providing table creation, resize, and Excel/TSV paste
 * functionality to the react-easy-editor.
 *
 * Registers StyledTable nodes directly (not via replacement API)
 * to avoid type-string conflicts with Lexical's internal
 * registerNodeTransform / registerMutationListener calls.
 */
export function TablePlugin(): PluginConfig {
  return {
    name: "table",
    nodes: [StyledTableNode, StyledTableRowNode, StyledTableCellNode],
    toolbar: {
      group: "media",
      priority: 3,
      render: InsertTableToolbarItem,
    },
    component: TablePluginComponent,
  };
}
