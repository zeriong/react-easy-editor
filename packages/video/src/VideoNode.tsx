import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  DecoratorNode,
} from "lexical";
import { VideoComponent } from "./VideoComponent";

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

export interface VideoPayload {
  id?: string;
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
}

type SerializedVideoNode = Spread<
  {
    type: "video";
    version: 1;
    id: string;
    src: string;
    poster: string;
    width: number | undefined;
    height: number | undefined;
    controls: boolean;
    loop: boolean;
    muted: boolean;
    playsInline: boolean;
    autoPlay: boolean;
  },
  SerializedLexicalNode
>;

/* ------------------------------------------------------------------ */
/*  VideoNode (DecoratorNode)                                          */
/* ------------------------------------------------------------------ */

export class VideoNode extends DecoratorNode<JSX.Element> {
  __id: string;
  __src: string;
  __poster: string;
  __width: number | undefined;
  __height: number | undefined;
  __controls: boolean;
  __loop: boolean;
  __muted: boolean;
  __playsInline: boolean;
  __autoPlay: boolean;

  /* -- static helpers -- */

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      {
        id: node.__id,
        src: node.__src,
        poster: node.__poster,
        width: node.__width,
        height: node.__height,
        controls: node.__controls,
        loop: node.__loop,
        muted: node.__muted,
        playsInline: node.__playsInline,
        autoPlay: node.__autoPlay,
      },
      node.__key,
    );
  }

  /* -- constructor -- */

  constructor(payload: VideoPayload, key?: NodeKey) {
    super(key);
    this.__id = payload.id || `ree_video_${Date.now()}_${Math.random()}`;
    this.__src = payload.src;
    this.__poster = payload.poster || "";
    this.__width = payload.width;
    this.__height = payload.height;
    this.__controls = payload.controls ?? true;
    this.__loop = !!payload.loop;
    this.__muted = !!payload.muted;
    this.__playsInline = payload.playsInline ?? true;
    this.__autoPlay = !!payload.autoPlay;
  }

  /* -- inline behaviour -- */

  isInline(): boolean {
    return true;
  }

  /* -- JSON serialisation -- */

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: "video",
      version: 1,
      id: this.__id,
      src: this.__src,
      poster: this.__poster,
      width: this.__width,
      height: this.__height,
      controls: this.__controls,
      loop: this.__loop,
      muted: this.__muted,
      playsInline: this.__playsInline,
      autoPlay: this.__autoPlay,
    };
  }

  static importJSON(json: SerializedVideoNode): VideoNode {
    return new VideoNode({
      id: json.id,
      src: json.src,
      poster: json.poster,
      width: json.width,
      height: json.height,
      controls: json.controls,
      loop: json.loop,
      muted: json.muted,
      playsInline: json.playsInline,
      autoPlay: json.autoPlay,
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
    el.className = "ree-video-wrapper";
    el.id = this.__id;
    el.setAttribute("data-lexical-decorator", "true");
    el.setAttribute("data-lexical-node-key", this.getKey());
    return el;
  }

  updateDOM(): boolean {
    return false;
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

    video.setAttribute("data-lexical-type", "video");

    if (Number.isFinite(this.__width)) {
      video.setAttribute("width", String(Math.round(this.__width!)));
      video.setAttribute("data-width", String(Math.round(this.__width!)));
    }
    if (Number.isFinite(this.__height)) {
      video.setAttribute("height", String(Math.round(this.__height!)));
      video.setAttribute("data-height", String(Math.round(this.__height!)));
    }

    return { element: video };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: (node: HTMLElement) => {
        const mark = node.getAttribute && node.getAttribute("data-lexical-type");
        if (mark === "video") {
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
                node: new VideoNode({
                  src,
                  poster,
                  width,
                  height,
                  controls: node.hasAttribute("controls"),
                  loop: node.hasAttribute("loop"),
                  muted: node.hasAttribute("muted"),
                  playsInline: node.hasAttribute("playsinline"),
                  autoPlay: node.hasAttribute("autoplay"),
                }),
              };
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
      <VideoComponent
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
}

/* ------------------------------------------------------------------ */
/*  Helper: create a VideoNode wrapped in a ParagraphNode              */
/* ------------------------------------------------------------------ */

export function $createVideoNode(payload: VideoPayload): LexicalNode {
  const p = $createParagraphNode();
  p.append(new VideoNode(payload));
  return p;
}

/* ------------------------------------------------------------------ */
/*  Helper: create an inline VideoNode (no paragraph wrapper)          */
/* ------------------------------------------------------------------ */

export function $createInlineVideoNode(payload: VideoPayload): VideoNode {
  return new VideoNode(payload);
}

/* ------------------------------------------------------------------ */
/*  Helper: insert an inline video at the current selection            */
/* ------------------------------------------------------------------ */

export function $insertInlineVideoAtSelection(payload: VideoPayload): void {
  const selection = $getSelection();
  const videoNode = new VideoNode({
    ...payload,
    id: `ree_video_${Date.now()}_${Math.random()}`,
  });

  if ($isRangeSelection(selection)) {
    const anchor = selection.anchor;
    const node = anchor.getNode();

    if ($isTextNode(node)) {
      const offset = anchor.offset;
      const size = node.getTextContentSize();
      if (offset > 0 && offset < size) node.splitText(offset);
    }

    selection.insertNodes([videoNode]);
    videoNode.selectNext();
  } else {
    const p = $createParagraphNode();
    p.append(videoNode);
    $getRoot().append(p);
    videoNode.selectNext();
  }
}
