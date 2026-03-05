import { useEffect, useRef } from "react";
import { $getNodeByKey, COMMAND_PRIORITY_LOW, DRAGOVER_COMMAND, DROP_COMMAND } from "lexical";
import { insertInlineImageAtSelection } from "../../utils/insertInlineNode.ts";
import { toBase64 } from "../../utils/common.ts";

import type { LexicalEditor } from "lexical";

interface ImageDnDPluginProps {
  editor: LexicalEditor;
  saveServerFetcher?: (file: File) => Promise<string>;
}

interface DragSession {
  active: boolean;
  fromKey: string | null;
  fromId: string | null;
}

export default function ImageDnDPlugin({ saveServerFetcher, editor }: ImageDnDPluginProps) {
  const dragRef = useRef<DragSession>({
    active: false,
    fromKey: null,
    fromId: null,
  });
  const dropHappenedRef = useRef<boolean>(false);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const resetSession = () => {
      dragRef.current.active = false;
      dragRef.current.fromKey = null;
      dragRef.current.fromId = null;
      dropHappenedRef.current = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      const wrapper = (e.target as HTMLElement).closest?.(".resizable-image-class");
      if (!wrapper) resetSession();
    };

    const onDragStart = (e: DragEvent) => {
      const wrapper = (e.target as HTMLElement).closest?.(".resizable-image-class");
      if (!wrapper) return;

      const nodeKey = wrapper.getAttribute("data-lexical-node-key");
      if (!nodeKey) return;

      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if (node && node.getType && node.getType() === "resizable-image") {
          dragRef.current.active = true;
          dragRef.current.fromKey = nodeKey;
          dragRef.current.fromId = wrapper.id || null;
          dropHappenedRef.current = false;

          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            try {
              e.dataTransfer.setData("application/x-lexical-node-key", nodeKey);
              e.dataTransfer.setData("text/plain", "");
            } catch (error) {
              console.log("error: ", error);
            }
          }
        }
      });
    };

    const onDragEnd = () => {
      setTimeout(() => {
        if (!dropHappenedRef.current) resetSession();
      }, 0);
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("dragstart", onDragStart);
    root.addEventListener("dragend", onDragEnd);

    const removeDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (e: DragEvent) => {
        const dtKey = e.dataTransfer?.getData?.("application/x-lexical-node-key");
        if (!(dragRef.current.active || dtKey)) return false;

        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        moveNativeCaretToPoint(editor, e.clientX, e.clientY);
        e.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    const removeDrop = editor.registerCommand(
      DROP_COMMAND,
      async (e: DragEvent) => {
        dropHappenedRef.current = true;

        const dt = e.dataTransfer;
        const dtKey = dt?.getData?.("application/x-lexical-node-key") || null;
        const file = dt?.files?.[0] || null;

        if (!file || !file.type?.includes("image")) {
          return false;
        }

        // === 1) Internal move takes priority ===
        if (dtKey || dragRef.current.active) {
          e.preventDefault();
          e.stopPropagation();

          moveNativeCaretToPoint(editor, e.clientX, e.clientY);

          const hintKey = dtKey || dragRef.current.fromKey;
          const hintId = dragRef.current.fromId;

          editor.update(() => {
            let original = hintKey ? $getNodeByKey(hintKey) : null;

            if (
              !(original && original.getType && original.getType() === "resizable-image") &&
              hintId
            ) {
              const el = document.getElementById(hintId);
              const k = el?.getAttribute?.("data-lexical-node-key");
              if (k) {
                const n2 = $getNodeByKey(k);
                if (n2 && n2.getType && n2.getType() === "resizable-image") {
                  original = n2;
                }
              }
            }

            if (!(original && original.getType && original.getType() === "resizable-image")) {
              return;
            }

            const payload = {
              id: `easy_lexical_image_wrapper_${Date.now() + Math.random()}`,
              src: (original as any).__src as string,
              alt: (original as any).__alt as string,
              width: (original as any).__width as number,
              height: (original as any).__height as number,
              style: (original as any).__style as string,
            };

            insertInlineImageAtSelection(payload);

            const parent = original.getParent && original.getParent();
            original.remove();
            if (parent?.getType?.() === "paragraph" && parent.getChildrenSize() === 0) {
              parent.remove();
            }
          });

          resetSession();
          return true;
        }

        // === 2) External file drop ===
        if (file) {
          e.preventDefault();
          e.stopPropagation();

          const src = saveServerFetcher ? await saveServerFetcher(file) : await toBase64(file);
          if (!src) return true;

          moveNativeCaretToPoint(editor, e.clientX, e.clientY);

          editor.update(() => {
            insertInlineImageAtSelection({ src: src as string, alt: file.name || "" });
          });

          resetSession();
          return true;
        }

        resetSession();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("dragstart", onDragStart);
      root.removeEventListener("dragend", onDragEnd);
      removeDragOver();
      removeDrop();
    };
  }, [editor, saveServerFetcher]);

  return null;
}

function moveNativeCaretToPoint(editor: LexicalEditor, x: number, y: number): void {
  const root = editor.getRootElement();
  if (!root) return;
  const doc = root.ownerDocument || document;

  let range: Range | null = null;
  if (typeof (doc as any).caretRangeFromPoint === "function") {
    range = (doc as any).caretRangeFromPoint(x, y) as Range | null;
  } else if (typeof (doc as any).caretPositionFromPoint === "function") {
    const pos = (doc as any).caretPositionFromPoint(x, y) as { offsetNode: Node; offset: number } | null;
    if (pos) {
      range = doc.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    }
  }
  if (range) {
    const sel = doc.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
