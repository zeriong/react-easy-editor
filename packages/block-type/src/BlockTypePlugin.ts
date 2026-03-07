import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { BlockTypeToolbarItem } from "./BlockTypeToolbarItem";

import type { PluginConfig } from "@react-easy-editor/core";

export function BlockTypePlugin(): PluginConfig {
  return {
    name: "block-type",
    nodes: [HeadingNode, QuoteNode],
    toolbar: {
      group: "block",
      priority: 1,
      render: BlockTypeToolbarItem,
    },
  };
}
