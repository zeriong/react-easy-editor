import { TableCellNode } from "@lexical/table";

import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";

type SerializedStyledTableCellNode = Spread<{
  type: "tableCell";
  style: string;
  isHeader: boolean;
  colSpan: number;
  rowSpan: number;
  __rev: number;
}, SerializedLexicalNode>;

export class StyledTableCellNode extends TableCellNode {
  __style: string;
  __rev: number;
  __isHeader: boolean;

  static getType(): string {
    return "tableCell";
  }

  static clone(node: StyledTableCellNode): StyledTableCellNode {
    const n = new StyledTableCellNode(
      node.__isHeader,
      node.__colSpan ?? 1,
      node.__rowSpan ?? 1,
      node.__style,
      node.__key,
    );
    n.__rev = node.__rev;
    return n;
  }

  constructor(isHeader: boolean, _colSpan?: number, _rowSpan?: number, style = "", key?: NodeKey) {
    super(!!isHeader, _colSpan, _rowSpan, key);
    this.__isHeader = !!isHeader;
    this.__style = style || "";
    this.__rev = 0;
  }

  getStyle(): string {
    return this.getLatest().__style || "";
  }

  setStyle(style: string): void {
    const w = this.getWritable();
    w.__style = style || "";
    w.__rev = (w.__rev | 0) + 1;
  }

  isHeader(): boolean {
    return !!this.getLatest().__isHeader;
  }

  setHeader(isHeader: boolean): void {
    const w = this.getWritable();
    w.__isHeader = !!isHeader;
    w.__rev = (w.__rev | 0) + 1;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const el = super.createDOM(config);

    if (this.__style) {
      el.setAttribute("style", this.__style);
    } else {
      el.removeAttribute("style");
    }

    const cs = this.__colSpan ?? 1;
    const rs = this.__rowSpan ?? 1;
    if (cs > 1) el.setAttribute("colspan", String(cs));
    else el.removeAttribute("colspan");
    if (rs > 1) el.setAttribute("rowspan", String(rs));
    else el.removeAttribute("rowspan");

    el.setAttribute("data-lexical-node-key", this.getKey());
    return el;
  }

  updateDOM(prev: StyledTableCellNode, dom: HTMLElement): boolean {
    if (!!prev.__isHeader !== !!this.__isHeader) {
      return true;
    }

    if (prev.__style !== this.__style) {
      if (this.__style) dom.setAttribute("style", this.__style);
      else dom.removeAttribute("style");
    }

    if ((prev.__colSpan ?? 1) !== (this.__colSpan ?? 1)) {
      const cs = this.__colSpan ?? 1;
      if (cs > 1) dom.setAttribute("colspan", String(cs));
      else dom.removeAttribute("colspan");
    }
    if ((prev.__rowSpan ?? 1) !== (this.__rowSpan ?? 1)) {
      const rs = this.__rowSpan ?? 1;
      if (rs > 1) dom.setAttribute("rowspan", String(rs));
      else dom.removeAttribute("rowspan");
    }

    return false;
  }

  static importJSON(json: SerializedStyledTableCellNode): StyledTableCellNode {
    const isHeader = !!json.isHeader || !!(json as Record<string, unknown>).header;
    const colSpan = json.colSpan || 1;
    const rowSpan = json.rowSpan || 1;
    const n = new StyledTableCellNode(isHeader, colSpan, rowSpan, json.style || "");
    n.__rev = json.__rev || 0;
    return n;
  }

  exportJSON(): SerializedStyledTableCellNode {
    const base = super.exportJSON();
    return {
      ...base,
      type: "tableCell",
      style: this.__style,
      isHeader: !!this.__isHeader,
      colSpan: this.__colSpan ?? 1,
      rowSpan: this.__rowSpan ?? 1,
      __rev: this.__rev,
    };
  }

  static importDOM(): DOMConversionMap | null {
    const conv = (el: HTMLElement, isHeader: boolean) => {
      const st = el.getAttribute("style") || "";
      const cs = parseInt(el.getAttribute("colspan") || "1", 10) || 1;
      const rs = parseInt(el.getAttribute("rowspan") || "1", 10) || 1;
      return { node: new StyledTableCellNode(!!isHeader, cs, rs, st) };
    };
    return {
      td: (_el: HTMLElement) => ({ conversion: () => conv(_el, false), priority: 2 }),
      th: (_el: HTMLElement) => ({ conversion: () => conv(_el, true), priority: 2 }),
    };
  }

  exportDOM(): DOMExportOutput {
    const tag = this.__isHeader ? "th" : "td";
    const el = document.createElement(tag);
    if (this.__style) el.setAttribute("style", this.__style);

    const cs = typeof this.getColSpan === "function" ? this.getColSpan() : this.__colSpan || 1;
    const rs = typeof this.getRowSpan === "function" ? this.getRowSpan() : this.__rowSpan || 1;
    if (cs > 1) el.setAttribute("colspan", String(cs));
    if (rs > 1) el.setAttribute("rowspan", String(rs));

    return { element: el };
  }
}
