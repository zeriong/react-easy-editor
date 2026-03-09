import { useEffect } from "react";
import {
  $createNodeSelection,
  $getNodeByKey,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
} from "lexical";
// Note: useEditorContext available for future video paste/DnD support

import { VideoNode } from "./VideoNode";
import { UPDATE_VIDEO_SIZE_COMMAND } from "./VideoComponent";

import type { LexicalEditor } from "lexical";

/* ------------------------------------------------------------------ */
/*  VideoPluginComponent                                               */
/*  Registers commands: click-select, resize                           */
/* ------------------------------------------------------------------ */

export function VideoPluginComponent({ editor }: { editor: LexicalEditor }) {
  /* ---- Resize update command handler ---- */

  useEffect(() => {
    const removeResizeUpdate = editor.registerCommand(
      UPDATE_VIDEO_SIZE_COMMAND,
      ({ key, width, height }) => {
        editor.update(
          () => {
            const n = $getNodeByKey(key);
            if (n instanceof VideoNode) {
              n.setSize(width, height);
            }
          },
          { discrete: true },
        );
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return removeResizeUpdate;
  }, [editor]);

  /* ---- Click-to-select handler ---- */

  useEffect(() => {
    const removeSelection = editor.registerCommand(
      CLICK_COMMAND,
      (event) => {
        const target = event.target as HTMLElement;
        if (target?.closest?.(".ree-video-wrapper")) {
          const videoElem = target.closest(".ree-video-wrapper");
          const nodeKey = videoElem?.getAttribute("data-lexical-node-key");

          if (nodeKey) {
            editor.update(() => {
              const selection = $createNodeSelection();
              selection.add(nodeKey);
              $setSelection(selection);
            });
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return removeSelection;
  }, [editor]);

  return null;
}
