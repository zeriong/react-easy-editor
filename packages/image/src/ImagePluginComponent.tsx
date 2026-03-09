import { useEffect, useRef } from "react";
import {
  $createNodeSelection,
  $getNodeByKey,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { useEditorContext, toBase64 } from "@react-easy-editor/core";

import { ImageNode, $insertInlineImageAtSelection } from "./ImageNode";
import { UPDATE_IMAGE_SIZE_COMMAND } from "./ImageComponent";

import type { LexicalEditor } from "lexical";

/* ------------------------------------------------------------------ */
/*  Internal drag session state                                        */
/* ------------------------------------------------------------------ */

interface DragSession {
  active: boolean;
  fromKey: string | null;
  fromId: string | null;
}

/* ------------------------------------------------------------------ */
/*  Utility: move native caret to a point (for DnD)                    */
/* ------------------------------------------------------------------ */

function moveNativeCaretToPoint(editor: LexicalEditor, x: number, y: number): void {
  const root = editor.getRootElement();
  if (!root) return;
  const doc = root.ownerDocument || document;

  let range: Range | null = null;
  if ("caretRangeFromPoint" in doc && typeof doc.caretRangeFromPoint === "function") {
    range = doc.caretRangeFromPoint(x, y) as Range | null;
  } else if ("caretPositionFromPoint" in doc && typeof doc.caretPositionFromPoint === "function") {
    const pos = doc.caretPositionFromPoint(x, y) as {
      offsetNode: Node;
      offset: number;
    } | null;
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

/* ------------------------------------------------------------------ */
/*  ImagePluginComponent                                               */
/*  Registers commands: paste, DnD, click-select, resize               */
/* ------------------------------------------------------------------ */

export function ImagePluginComponent({ editor }: { editor: LexicalEditor }) {
  const { saveServerFetcher } = useEditorContext();

  const dragRef = useRef<DragSession>({
    active: false,
    fromKey: null,
    fromId: null,
  });
  const dropHappenedRef = useRef(false);

  /* ---- Paste handler ---- */

  useEffect(() => {
    const removePaste = editor.registerCommand(
      PASTE_COMMAND,
      (e: ClipboardEvent) => {
        const file = e.clipboardData?.files?.[0];
        if (!file || !file.type?.includes("image")) return false;

        e.preventDefault();
        (async () => {
          const src = saveServerFetcher
            ? await saveServerFetcher(file)
            : await toBase64(file);
          if (!src) return;
          editor.update(() =>
            $insertInlineImageAtSelection({ src: src as string, alt: file.name || "" }),
          );
        })();

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return removePaste;
  }, [editor, saveServerFetcher]);

  /* ---- Drag & Drop handler ---- */

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
      const wrapper = (e.target as HTMLElement).closest?.(".ree-image-wrapper");
      if (!wrapper) resetSession();
    };

    const onDragStart = (e: DragEvent) => {
      const wrapper = (e.target as HTMLElement).closest?.(".ree-image-wrapper");
      if (!wrapper) return;

      const nodeKey = wrapper.getAttribute("data-lexical-node-key");
      if (!nodeKey) return;

      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);
        if (node && node.getType?.() === "image") {
          dragRef.current.active = true;
          dragRef.current.fromKey = nodeKey;
          dragRef.current.fromId = wrapper.id || null;
          dropHappenedRef.current = false;

          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            try {
              e.dataTransfer.setData("application/x-lexical-node-key", nodeKey);
              e.dataTransfer.setData("text/plain", "");
            } catch {
              // ignore
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
      (e: DragEvent) => {
        dropHappenedRef.current = true;

        const dt = e.dataTransfer;
        const dtKey = dt?.getData?.("application/x-lexical-node-key") || null;
        const file = dt?.files?.[0] || null;

        if (!file || !file.type?.includes("image")) {
          return false;
        }

        // Internal move takes priority
        if (dtKey || dragRef.current.active) {
          e.preventDefault();
          e.stopPropagation();

          moveNativeCaretToPoint(editor, e.clientX, e.clientY);

          const hintKey = dtKey || dragRef.current.fromKey;
          const hintId = dragRef.current.fromId;

          editor.update(() => {
            let original = hintKey ? $getNodeByKey(hintKey) : null;

            if (!(original && original.getType?.() === "image") && hintId) {
              const el = document.getElementById(hintId);
              const k = el?.getAttribute?.("data-lexical-node-key");
              if (k) {
                const n2 = $getNodeByKey(k);
                if (n2 && n2.getType?.() === "image") original = n2;
              }
            }

            if (!(original instanceof ImageNode)) return;

            const payload = {
              src: original.__src,
              alt: original.__alt,
              width: original.__width,
              height: original.__height,
            };

            $insertInlineImageAtSelection(payload);

            const parent = original.getParent?.();
            original.remove();
            if (parent?.getType?.() === "paragraph" && parent.getChildrenSize() === 0) {
              parent.remove();
            }
          });

          resetSession();
          return true;
        }

        // External file drop
        if (file) {
          e.preventDefault();
          e.stopPropagation();

          (async () => {
            const src = saveServerFetcher
              ? await saveServerFetcher(file)
              : await toBase64(file);
            if (!src) return;

            moveNativeCaretToPoint(editor, e.clientX, e.clientY);

            editor.update(() => {
              $insertInlineImageAtSelection({ src: src as string, alt: file.name || "" });
            });

            resetSession();
          })();

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

  /* ---- Resize update command handler ---- */

  useEffect(() => {
    const removeResizeUpdate = editor.registerCommand(
      UPDATE_IMAGE_SIZE_COMMAND,
      ({ key, width, height }) => {
        editor.update(
          () => {
            const n = $getNodeByKey(key);
            if (n instanceof ImageNode) {
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
        if (target?.closest?.(".ree-image-wrapper")) {
          const imageElem = target.closest(".ree-image-wrapper");
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

    return removeSelection;
  }, [editor]);

  return null;
}
