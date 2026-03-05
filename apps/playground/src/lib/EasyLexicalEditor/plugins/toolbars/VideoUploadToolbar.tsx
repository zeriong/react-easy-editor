import { useEffect, useRef } from "react";
import {
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  CLICK_COMMAND,
  $createNodeSelection,
  $setSelection,
} from "lexical";
import { ResizableVideoNode } from "../../nodes/ResizableVideoNode.tsx";
import { UPDATE_VIDEO_SIZE_COMMAND } from "../../instance/index.ts";
import { insertInlineVideoAtSelection } from "../../utils/insertInlineNode.ts";

import type { LexicalEditor } from "lexical";
import type { ChangeEvent } from "react";

interface VideoUploadToolbarProps {
  editor: LexicalEditor;
  saveServerFetcher?: (file: File) => Promise<string>;
}

export default function VideoUploadToolbar({ editor, saveServerFetcher }: VideoUploadToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onPickVideo = () => fileInputRef.current && fileInputRef.current.click();

  const onFileChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];
    target.value = "";
    if (!file || !file.type?.includes("video")) return;

    let src: string | null = null;
    try {
      src = saveServerFetcher ? await saveServerFetcher(file) : URL.createObjectURL(file);
    } catch (e) {
      console.log("error", e);
      return;
    }
    if (!src) return;

    editor.update(() => {
      insertInlineVideoAtSelection({
        src,
        poster: "",
        controls: true,
        muted: true,
        playsInline: true,
      });
    });
  };

  useEffect(() => {
    const removeResizeUpdate = editor.registerCommand(
      UPDATE_VIDEO_SIZE_COMMAND,
      ({ key, width, height }) => {
        editor.update(() => {
          const n = $getNodeByKey(key);
          if (n && (n instanceof ResizableVideoNode || n.getType?.() === "resizable-video")) {
            (n as unknown as { setSize: (w: number, h: number) => void }).setSize(width, height);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const removeSelection = editor.registerCommand(
      CLICK_COMMAND,
      (event) => {
        const target = event.target as HTMLElement;
        if (target && target.closest && target.closest(".resizable-video-class")) {
          const wrapper = target.closest(".resizable-video-class");
          const nodeKey = wrapper?.getAttribute("data-lexical-node-key");
          if (nodeKey) {
            editor.update(() => {
              const sel = $createNodeSelection();
              sel.add(nodeKey);
              $setSelection(sel);
            });
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeResizeUpdate();
      removeSelection();
    };
  }, [editor]);

  return (
    <>
      <button onClick={onPickVideo} className="toolbar-item spaced" aria-label="Insert Video">
        <i className="format video-upload" />
      </button>
      <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={onFileChange} />
    </>
  );
}
