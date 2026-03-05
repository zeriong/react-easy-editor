import { useEffect, useRef } from "react";
import {
  $createNodeSelection,
  $getNodeByKey,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { ResizableImageNode } from "../../nodes/ResizableImageNode.tsx";
import { toast, UPDATE_IMAGE_SIZE_COMMAND } from "../../instance/index.ts";
import { insertInlineImageAtSelection } from "../../utils/insertInlineNode.ts";
import { toBase64 } from "../../utils/common.ts";

import type { LexicalEditor } from "lexical";
import type { ChangeEvent } from "react";

interface ImageUploadToolbarProps {
  editor: LexicalEditor;
  saveServerFetcher?: (file: File) => Promise<string>;
}

export default function ImageUploadToolbar({ editor, saveServerFetcher }: ImageUploadToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickImage = () => fileInputRef.current && fileInputRef.current.click();

  const onFileChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files && target.files[0];
    if (!file || !file.type?.includes("image")) {
      toast.warn("이미지 파일이 아닙니다.");
      target.value = "";
      return false;
    }

    let src: string | ArrayBuffer | null = null;
    try {
      src = saveServerFetcher ? await saveServerFetcher(file) : await toBase64(file);
    } finally {
      target.value = "";
    }
    if (!src) return;

    editor.update(() => {
      insertInlineImageAtSelection({
        src: src as string,
        alt: file.name || "",
      });
    });
  };

  useEffect(() => {
    const removeResizeUpdate = editor.registerCommand(
      UPDATE_IMAGE_SIZE_COMMAND,
      ({ key, width, height }) => {
        editor.update(
          () => {
            const n = $getNodeByKey(key);
            if (n && (n instanceof ResizableImageNode || n.getType?.() === "resizable-image")) {
              (n as unknown as { setSize: (w: number, h: number) => void }).setSize(width, height);
            }
          },
          { discrete: true },
        );
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const removeSelection = editor.registerCommand(
      CLICK_COMMAND,
      (event) => {
        const target = event.target as HTMLElement;
        if (target && target.closest && target.closest(".resizable-image-class")) {
          const imageElem = target.closest(".resizable-image-class");
          const nodeKey = imageElem?.getAttribute("data-lexical-node-key");

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

    return () => {
      removeResizeUpdate();
      removeSelection();
    };
  }, [editor]);

  return (
    <>
      <button onClick={onPickImage} className="toolbar-item spaced" aria-label="Insert Image">
        <i className="format image-upload" />
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
    </>
  );
}
