import { TableRowNode } from "@lexical/table";

import type { DOMConversionMap, DOMExportOutput, EditorConfig, NodeKey, SerializedLexicalNode, Spread } from "lexical";

function setStyleProp(styleString = "", prop: string, value: string | null | undefined): string {
  const map = new Map<string, string>();
  styleString
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const i = pair.indexOf(":");
      if (i < 0) return;
      const k = pair.slice(0, i).trim().toLowerCase();
      const v = pair.slice(i + 1).trim();
      map.set(k, v);
    });

  const key = String(prop).toLowerCase();
  if (value == null || value === "") map.delete(key);
  else map.set(key, String(value));

  return Array.from(map.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

function normalizeRowStyle(style = ""): string {
  return (style || "").trim();
}

type SerializedStyledTableRowNode = Spread<{
  type: "tableRow";
  style: string;
  __rev: number;
  height?: number;
}, SerializedLexicalNode>;

export class StyledTableRowNode extends TableRowNode {
  __style: string;
  __rev: number;

  static getType(): string {
    return "tableRow";
  }

  static clone(node: StyledTableRowNode): StyledTableRowNode {
    const n = new StyledTableRowNode(node.__height, node.__style, node.__key);
    n.__rev = node.__rev;
    return n;
  }

  constructor(height?: number, style = "", key?: NodeKey) {
    super(height, key);
    this.__style = normalizeRowStyle(style);
    this.__rev = 0;
  }

  getStyle(): string {
    return this.getLatest().__style || "";
  }

  setStyle(style: string): void {
    const w = this.getWritable();
    w.__style = normalizeRowStyle(style || "");
    w.__rev = (w.__rev | 0) + 1;
  }

  setHeight(px: number | string): void {
    const v =
      typeof px === "number" && Number.isFinite(px) ? `${Math.max(0, Math.round(px))}px` : String(px);
    this.setStyle(setStyleProp(this.getStyle(), "height", v));
  }

  bumpRevision(): void {
    const w = this.getWritable();
    w.__rev = (w.__rev | 0) + 1;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const el = super.createDOM(config);
    el.setAttribute("data-lexical-node-key", this.getKey());

    const style = normalizeRowStyle(this.__style);
    if (style) el.setAttribute("style", style);
    else el.removeAttribute("style");

    return el;
  }

  updateDOM(prev: StyledTableRowNode, dom: HTMLElement): boolean {
    const prevStyle = normalizeRowStyle(prev.__style);
    const nextStyle = normalizeRowStyle(this.__style);

    if (prevStyle !== nextStyle) {
      if (nextStyle) dom.setAttribute("style", nextStyle);
      else dom.removeAttribute("style");
    }

    return false;
  }

  static importJSON(json: SerializedStyledTableRowNode): StyledTableRowNode {
    const n = new StyledTableRowNode(json.height, normalizeRowStyle(json.style || ""));
    n.__rev = json.__rev || 0;
    return n;
  }

  exportJSON(): SerializedStyledTableRowNode {
    const base = super.exportJSON();
    return {
      ...base,
      type: "tableRow",
      style: normalizeRowStyle(this.__style),
      __rev: this.__rev,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      tr: (_el: HTMLElement) => ({
        conversion: () => {
          const st = _el.getAttribute("style") || "";
          return { node: new StyledTableRowNode(undefined, normalizeRowStyle(st)) };
        },
        priority: 2,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement("tr");
    const style = normalizeRowStyle(this.__style);
    if (style) el.setAttribute("style", style);
    else el.removeAttribute("style");
    return { element: el };
  }
}
