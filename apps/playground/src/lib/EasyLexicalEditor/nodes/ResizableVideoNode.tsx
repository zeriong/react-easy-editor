import { $createParagraphNode, DecoratorNode } from "lexical";
import BridgeResizableVideo from "../components/resizableVideo/BridgeResizableVideo.tsx";

import type { DOMConversionMap, DOMExportOutput, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import type { JSX } from "react";

export interface ResizableVideoPayload {
  id?: string;
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  style?: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
}

type SerializedResizableVideoNode = Spread<{
  type: "resizable-video";
  version: 1;
  id: string;
  src: string;
  poster: string;
  width: number | undefined;
  height: number | undefined;
  style: string;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  playsInline: boolean;
  autoPlay: boolean;
}, SerializedLexicalNode>;

export class ResizableVideoNode extends DecoratorNode<JSX.Element> {
  __id: string;
  __src: string;
  __poster: string;
  __width: number | undefined;
  __height: number | undefined;
  __style: string;
  __controls: boolean;
  __loop: boolean;
  __muted: boolean;
  __playsInline: boolean;
  __autoPlay: boolean;

  static getType(): string {
    return "resizable-video";
  }

  static clone(node: ResizableVideoNode): ResizableVideoNode {
    return new ResizableVideoNode(
      {
        id: node.__id,
        src: node.__src,
        poster: node.__poster,
        width: node.__width,
        height: node.__height,
        style: node.__style,
        controls: node.__controls,
        loop: node.__loop,
        muted: node.__muted,
        playsInline: node.__playsInline,
        autoPlay: node.__autoPlay,
      },
      node.__key,
    );
  }

  constructor(payload: ResizableVideoPayload, key?: NodeKey) {
    super(key);
    this.__id = payload.id || `easy_lexical_video_wrapper_${Date.now() + Math.random()}`;
    this.__src = payload.src;
    this.__poster = payload.poster || "";
    this.__width = payload.width;
    this.__height = payload.height;
    this.__style = payload.style || "";
    this.__controls = payload.controls ?? true;
    this.__loop = !!payload.loop;
    this.__muted = !!payload.muted;
    this.__playsInline = payload.playsInline ?? true;
    this.__autoPlay = !!payload.autoPlay;
  }

  isInline(): boolean {
    return true;
  }

  exportJSON(): SerializedResizableVideoNode {
    return {
      ...super.exportJSON(),
      type: "resizable-video",
      version: 1,
      id: this.__id,
      src: this.__src,
      poster: this.__poster,
      width: this.__width,
      height: this.__height,
      style: this.__style,
      controls: this.__controls,
      loop: this.__loop,
      muted: this.__muted,
      playsInline: this.__playsInline,
      autoPlay: this.__autoPlay,
    };
  }

  static importJSON(json: SerializedResizableVideoNode): ResizableVideoNode {
    return new ResizableVideoNode({
      id: json.id,
      src: json.src,
      poster: json.poster,
      width: json.width,
      height: json.height,
      style: json.style,
      controls: json.controls,
      loop: json.loop,
      muted: json.muted,
      playsInline: json.playsInline,
      autoPlay: json.autoPlay,
    });
  }

  setSize(w: number, h: number): void {
    const wnode = this.getWritable();
    if (!Number.isFinite(h)) {
      try {
        const el = (this as unknown as { getEditor: () => LexicalEditor }).getEditor()?.getElementByKey?.(this.getKey());
        const frame = el?.querySelector?.(":scope > span") || el;
        const rect = frame?.getBoundingClientRect?.();
        wnode.__height = rect ? Math.max(1, Math.round(rect.height)) : w;
      } catch (e) {
        console.log("error: ", e);
        wnode.__height = h;
      }
    } else {
      wnode.__height = h;
    }
    wnode.__width = Number.isFinite(w) ? w : wnode.__width;
  }

  setSrc(src: string): void {
    const wnode = this.getWritable();
    wnode.__src = src;
  }

  createDOM(): HTMLElement {
    const el = document.createElement("span");
    el.style.display = "inline-block";
    el.style.position = "relative";
    el.style.userSelect = "none";
    el.className = "resizable-video-class";
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
      <BridgeResizableVideo
        editor={editor}
        nodeKey={this.getKey()}
        src={this.__src}
        poster={this.__poster}
        width={this.__width}
        height={this.__height}
        controls={this.__controls}
        loop={this.__loop}
        muted={this.__muted}
        playsInline={this.__playsInline}
        autoPlay={this.__autoPlay}
      />
    );
  }

  exportDOM(): DOMExportOutput {
    const video = document.createElement("video");
    video.src = this.__src;
    if (this.__poster) video.poster = this.__poster;
    if (this.__controls) video.setAttribute("controls", "");
    if (this.__loop) video.setAttribute("loop", "");
    if (this.__muted) video.setAttribute("muted", "");
    if (this.__playsInline) video.setAttribute("playsinline", "");
    if (this.__autoPlay) video.setAttribute("autoplay", "");

    video.setAttribute("data-lexical-type", "resizable-video");

    if (Number.isFinite(this.__width))
      video.setAttribute("width", String(Math.round(this.__width!)));
    if (Number.isFinite(this.__height))
      video.setAttribute("height", String(Math.round(this.__height!)));

    if (Number.isFinite(this.__width))
      video.setAttribute("data-width", String(Math.round(this.__width!)));
    if (Number.isFinite(this.__height))
      video.setAttribute("data-height", String(Math.round(this.__height!)));

    if (this.__style) video.setAttribute("style", this.__style);

    return { element: video };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: (node: HTMLElement) => {
        const mark = node.getAttribute && node.getAttribute("data-lexical-type");
        if (mark === "resizable-video") {
          return {
            priority: 2,
            conversion: () => {
              const src = node.getAttribute("src") || "";
              const poster = node.getAttribute("poster") || "";
              const wAttr = node.getAttribute("data-width") || node.getAttribute("width");
              const hAttr = node.getAttribute("data-height") || node.getAttribute("height");
              const width = wAttr ? parseInt(wAttr, 10) : undefined;
              const height = hAttr ? parseInt(hAttr, 10) : undefined;

              return {
                node: new ResizableVideoNode({
                  src,
                  poster,
                  width,
                  height,
                  controls: node.hasAttribute("controls"),
                  loop: node.hasAttribute("loop"),
                  muted: node.hasAttribute("muted"),
                  playsInline: node.hasAttribute("playsinline"),
                  autoPlay: node.hasAttribute("autoplay"),
                  style: node.getAttribute("style") || "",
                }),
              };
            },
          };
        }
        return null;
      },
    };
  }
}

export function $createResizableVideoNode(payload: ResizableVideoPayload): LexicalNode {
  const p = $createParagraphNode();
  p.append(new ResizableVideoNode(payload));
  return p;
}

export function $createInlineResizableVideoNode(payload: ResizableVideoPayload): ResizableVideoNode {
  return new ResizableVideoNode(payload);
}
