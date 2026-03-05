import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $getRoot,
  $createParagraphNode,
  $isNodeSelection,
} from "lexical";
import { ResizableImageNode } from "../nodes/ResizableImageNode.tsx";
import {
  $createInlineResizableVideoNode,
  $createResizableVideoNode,
} from "../nodes/ResizableVideoNode.tsx";

import type { ResizableImagePayload } from "../nodes/ResizableImageNode.tsx";
import type { ResizableVideoPayload } from "../nodes/ResizableVideoNode.tsx";

export function insertInlineImageAtSelection(payload: ResizableImagePayload): void {
  const selection = $getSelection();
  const imageNode = new ResizableImageNode({
    ...payload,
    id: `easy_lexical_image_wrapper_${Date.now() + Math.random()}`,
  });

  if ($isRangeSelection(selection)) {
    const anchor = selection.anchor;
    const node = anchor.getNode();

    if ($isTextNode(node)) {
      const offset = anchor.offset;
      const size = node.getTextContentSize();
      if (offset > 0 && offset < size) node.splitText(offset);
    }

    selection.insertNodes([imageNode]);
    imageNode.selectNext();
  } else {
    const p = $createParagraphNode();
    p.append(imageNode);
    $getRoot().append(p);
    imageNode.selectNext();
  }
}

export const insertInlineVideoAtSelection = (payload: ResizableVideoPayload): boolean => {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    const anchor = selection.anchor;
    const node = anchor.getNode();

    if ($isTextNode(node)) {
      const offset = anchor.offset;
      const len = node.getTextContentSize();
      if (offset > 0 && offset < len) {
        node.splitText(offset);
      }
    }

    selection.insertNodes([$createInlineResizableVideoNode(payload)]);
    return true;
  }

  if ($isNodeSelection?.(selection)) {
    const nodes = selection!.getNodes();
    const first = nodes[0];
    if (first && typeof first.getTopLevelElementOrThrow === "function") {
      const top = first.getTopLevelElementOrThrow();
      const paragraph = $createResizableVideoNode(payload);
      top.insertAfter(paragraph);
      (paragraph as unknown as { selectEnd?: () => void }).selectEnd?.();
      return true;
    }
  }

  const paragraph = $createResizableVideoNode(payload);
  $getRoot().append(paragraph);
  (paragraph as unknown as { selectEnd?: () => void }).selectEnd?.();
  return true;
};
