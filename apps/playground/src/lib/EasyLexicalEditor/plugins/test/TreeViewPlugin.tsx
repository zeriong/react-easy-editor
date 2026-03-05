import { TreeView } from "@lexical/react/LexicalTreeView";

import type { LexicalEditor } from "lexical";

interface TreeViewPluginProps {
  editor: LexicalEditor;
}

export default function TreeViewPlugin({ editor }: TreeViewPluginProps) {
  return (
    <TreeView
      viewClassName="tree-view-output"
      treeTypeButtonClassName="debug-treetype-button"
      timeTravelPanelClassName="debug-timetravel-panel"
      timeTravelButtonClassName="debug-timetravel-button"
      timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
      timeTravelPanelButtonClassName="debug-timetravel-panel-button"
      editor={editor}
    />
  );
}
