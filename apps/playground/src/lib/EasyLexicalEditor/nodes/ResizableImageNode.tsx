import { $createParagraphNode, DecoratorNode } from "lexical";
import BridgeResizableImage from "../components/resizableImage/BridgeResizableImage.tsx";

import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import type { JSX } from "react";

export interface ResizableImagePayload {
  id?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  style?: string;
}

type SerializedResizableImageNode = Spread<{
  type: "resizable-image";
  version: 1;
  id: string;
  src: string;
  alt: string;
  width: number | undefined;
  height: number | undefined;
}, SerializedLexicalNode>;

export class ResizableImageNode extends DecoratorNode<JSX.Element> {
  __id: string;
  __src: string;
  __alt: string;
  __width: number | undefined;
  __height: number | undefined;
  __style: string | undefined;

  static getType(): string {
    return "resizable-image";
  }
  static clone(node: ResizableImageNode): ResizableImageNode {
    return new ResizableImageNode(
      {
        id: node.__id,
        src: node.__src,
        alt: node.__alt,
        width: node.__width,
        height: node.__height,
        style: node.__style,
      },
      node.__key,
    );
  }

  constructor(payload: ResizableImagePayload, key?: NodeKey) {
    super(key);
    this.__id = payload.id || `easy_lexical_image_wrapper_${Date.now() + Math.random()}`;
    this.__src = payload.src;
    this.__alt = payload.alt || "";
    this.__width = payload.width;
    this.__height = payload.height;
    this.__style = payload.style;
  }

  isInline(): boolean {
    return true;
  }

  exportJSON(): SerializedResizableImageNode {
    return {
      ...super.exportJSON(),
      type: "resizable-image",
      version: 1,
      id: this.__id,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
    };
  }
  static importJSON(json: SerializedResizableImageNode): ResizableImageNode {
    return new ResizableImageNode({
      id: json.id,
      src: json.src,
      alt: json.alt,
      width: json.width,
      height: json.height,
    });
  }

  setSize(w: number, h: number): void {
    const writable = this.getWritable();
    writable.__width = w;
    writable.__height = h;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  createDOM(): HTMLElement {
    const el = document.createElement("span");
    el.style.display = "inline-block";
    el.style.position = "relative";
    el.style.userSelect = "none";
    el.className = "resizable-image-class";
    el.id = this.__id;
    el.setAttribute("data-lexical-decorator", "true");
    el.setAttribute("data-lexical-node-key", this.getKey());
    return el;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <BridgeResizableImage
        editor={editor}
        nodeKey={this.getKey()}
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
      />
    );
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.src = this.__src;
    if (this.__alt) img.alt = this.__alt;

    img.setAttribute("data-lexical-type", "resizable-image");

    if (Number.isFinite(this.__width)) {
      img.setAttribute("width", String(Math.round(this.__width!)));
    }
    if (Number.isFinite(this.__height)) {
      img.setAttribute("height", String(Math.round(this.__height!)));
    }

    if (Number.isFinite(this.__width)) {
      img.setAttribute("data-width", String(Math.round(this.__width!)));
    }
    if (Number.isFinite(this.__height)) {
      img.setAttribute("data-height", String(Math.round(this.__height!)));
    }

    return { element: img };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: HTMLElement) => {
        const mark = node.getAttribute && node.getAttribute("data-lexical-type");
        if (mark === "resizable-image") {
          return {
            priority: 2,
            conversion: () => {
              const src = node.getAttribute("src") || "";
              const alt = node.getAttribute("alt") || "";
              const wAttr = node.getAttribute("data-width") || node.getAttribute("width");
              const hAttr = node.getAttribute("data-height") || node.getAttribute("height");
              const width = wAttr ? parseInt(wAttr, 10) : undefined;
              const height = hAttr ? parseInt(hAttr, 10) : undefined;

              return { node: new ResizableImageNode({ src, alt, width, height }) };
            },
          };
        }
        return null;
      },
    };
  }
}

export function $createResizableImageNode(payload: ResizableImagePayload): LexicalNode {
  console.log("이미지 페이로드", payload);
  const node = $createParagraphNode();
  node.append(new ResizableImageNode(payload));

  return node;
}

export function $createInlineResizableImageNode(payload: ResizableImagePayload): ResizableImageNode {
  return new ResizableImageNode(payload);
}
