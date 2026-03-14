import { TableNode } from "@lexical/table";

import type { SerializedTableNode } from "@lexical/table";
import type { DOMConversionMap, DOMExportOutput, EditorConfig, NodeKey, Spread } from "lexical";

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

function ensureBaseStyles(styleString = ""): string {
  let s = styleString || "";
  s = setStyleProp(s, "table-layout", "fixed");
  s = setStyleProp(s, "border-collapse", "collapse");
  return s.trim();
}

type SerializedStyledTableNode = Spread<{
  style: string;
  __rev: number;
}, SerializedTableNode>;

export class StyledTableNode extends TableNode {
  __style: string;
  __rev: number;

  static getType(): string {
    return "table";
  }

  static clone(node: StyledTableNode): StyledTableNode {
    const n = new StyledTableNode(node.__style, node.__key);
    n.__rev = node.__rev;
    return n;
  }

  constructor(style = "", key?: NodeKey) {
    super(key);
    this.__style = ensureBaseStyles(style);
    this.__rev = 0;
  }

  getStyle(): string {
    return this.getLatest().__style || "";
  }

  setStyle(style: string): this {
    const w = this.getWritable();
    w.__style = ensureBaseStyles(style || "");
    w.__rev = (w.__rev | 0) + 1;
    return w;
  }

  bumpRevision(): void {
    const w = this.getWritable();
    w.__rev = (w.__rev | 0) + 1;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const el = super.createDOM(config);
    el.setAttribute("data-lexical-node-key", this.getKey());

    const style = ensureBaseStyles(this.__style);
    if (style) el.setAttribute("style", style);
    else el.removeAttribute("style");

    return el;
  }

  updateDOM(prev: StyledTableNode, dom: HTMLElement): boolean {
    const nextStyle = ensureBaseStyles(this.__style);
    const prevStyle = ensureBaseStyles(prev.__style);

    if (prevStyle !== nextStyle) {
      if (nextStyle) dom.setAttribute("style", nextStyle);
      else dom.removeAttribute("style");
    }

    return false;
  }

  static importJSON(json: SerializedStyledTableNode): StyledTableNode {
    const n = new StyledTableNode(ensureBaseStyles(json.style || ""));
    n.__rev = json.__rev || 0;
    return n;
  }

  exportJSON(): SerializedStyledTableNode {
    const base = super.exportJSON();
    return {
      ...base,
      type: "table",
      style: ensureBaseStyles(this.__style),
      __rev: this.__rev,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      table: (_el: HTMLElement) => ({
        conversion: () => {
          const st = _el.getAttribute("style") || "";
          return { node: new StyledTableNode(ensureBaseStyles(st)) };
        },
        priority: 2,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement("table");
    const style = ensureBaseStyles(this.__style);
    if (style) el.setAttribute("style", style);
    else el.removeAttribute("style");
    return { element: el };
  }
}
