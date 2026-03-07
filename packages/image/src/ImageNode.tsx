import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  DecoratorNode,
} from "lexical";
import { ImageComponent } from "./ImageComponent";

import type {
  DOMConversionMap,
  DOMExportOutput,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import type { JSX } from "react";

/* ------------------------------------------------------------------ */
/*  Payload / serialisation types                                      */
/* ------------------------------------------------------------------ */

export interface ImagePayload {
  id?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

type SerializedImageNode = Spread<
  {
    type: "image";
    version: 1;
    id: string;
    src: string;
    alt: string;
    width: number | undefined;
    height: number | undefined;
  },
  SerializedLexicalNode
>;

/* ------------------------------------------------------------------ */
/*  ImageNode (DecoratorNode)                                          */
/* ------------------------------------------------------------------ */

export class ImageNode extends DecoratorNode<JSX.Element> {
  __id: string;
  __src: string;
  __alt: string;
  __width: number | undefined;
  __height: number | undefined;

  /* -- static helpers -- */

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      {
        id: node.__id,
        src: node.__src,
        alt: node.__alt,
        width: node.__width,
        height: node.__height,
      },
      node.__key,
    );
  }

  /* -- constructor -- */

  constructor(payload: ImagePayload, key?: NodeKey) {
    super(key);
    this.__id = payload.id || `ree_image_${Date.now()}_${Math.random()}`;
    this.__src = payload.src;
    this.__alt = payload.alt || "";
    this.__width = payload.width;
    this.__height = payload.height;
  }

  /* -- inline behaviour -- */

  isInline(): boolean {
    return true;
  }

  /* -- JSON serialisation -- */

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: "image",
      version: 1,
      id: this.__id,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
    };
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return new ImageNode({
      id: json.id,
      src: json.src,
      alt: json.alt,
      width: json.width,
      height: json.height,
    });
  }

  /* -- mutators -- */

  setSize(w: number, h: number): void {
    const writable = this.getWritable();
    writable.__width = w;
    writable.__height = h;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  /* -- DOM -- */

  createDOM(): HTMLElement {
    const el = document.createElement("span");
    el.style.display = "inline-block";
    el.style.position = "relative";
    el.style.userSelect = "none";
    el.className = "ree-image-wrapper";
    el.id = this.__id;
    el.setAttribute("data-lexical-decorator", "true");
    el.setAttribute("data-lexical-node-key", this.getKey());
    return el;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.src = this.__src;
    if (this.__alt) img.alt = this.__alt;

    img.setAttribute("data-lexical-type", "image");

    if (Number.isFinite(this.__width)) {
      img.setAttribute("width", String(Math.round(this.__width!)));
      img.setAttribute("data-width", String(Math.round(this.__width!)));
    }
    if (Number.isFinite(this.__height)) {
      img.setAttribute("height", String(Math.round(this.__height!)));
      img.setAttribute("data-height", String(Math.round(this.__height!)));
    }

    return { element: img };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: HTMLElement) => {
        const mark = node.getAttribute && node.getAttribute("data-lexical-type");
        if (mark === "image") {
          return {
            priority: 2,
            conversion: () => {
              const src = node.getAttribute("src") || "";
              const alt = node.getAttribute("alt") || "";
              const wAttr = node.getAttribute("data-width") || node.getAttribute("width");
              const hAttr = node.getAttribute("data-height") || node.getAttribute("height");
              const width = wAttr ? parseInt(wAttr, 10) : undefined;
              const height = hAttr ? parseInt(hAttr, 10) : undefined;

              return { node: new ImageNode({ src, alt, width, height }) };
            },
          };
        }
        return null;
      },
    };
  }

  /* -- decorator -- */

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <ImageComponent
        editor={editor}
        nodeKey={this.getKey()}
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
      />
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: create an ImageNode wrapped in a ParagraphNode             */
/* ------------------------------------------------------------------ */

export function $createImageNode(payload: ImagePayload): LexicalNode {
  const p = $createParagraphNode();
  p.append(new ImageNode(payload));
  return p;
}

/* ------------------------------------------------------------------ */
/*  Helper: create an inline ImageNode (no paragraph wrapper)          */
/* ------------------------------------------------------------------ */

export function $createInlineImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(payload);
}

/* ------------------------------------------------------------------ */
/*  Helper: insert an inline image at the current selection            */
/* ------------------------------------------------------------------ */

export function $insertInlineImageAtSelection(payload: ImagePayload): void {
  const selection = $getSelection();
  const imageNode = new ImageNode({
    ...payload,
    id: `ree_image_${Date.now()}_${Math.random()}`,
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
