// plugins/ExcelPastePlugin.tsx
import { useEffect } from "react";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  PASTE_COMMAND,
} from "lexical";
import { mergeStyles, parseCssRules } from "../../utils/cssInline.ts";
import { StyledTableRowNode } from "../../nodes/table/StyledTableRowNode.ts";
import { StyledTableNode } from "../../nodes/table/StyledTableNode.ts";
import { StyledTableCellNode } from "../../nodes/table/StyledTableCellNode.ts";
import { $insertLineBreakNode } from "../../utils/common.ts";

import type { LexicalEditor, ParagraphNode } from "lexical";

const PT_TO_PX = 96 / 72;

function toPx(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(parseFloat(s));
  const mPx = s.match(/([\d.]+)\s*px/i);
  if (mPx) return Math.round(parseFloat(mPx[1]));
  const mPt = s.match(/([\d.]+)\s*pt/i);
  if (mPt) return Math.round(parseFloat(mPt[1]) * PT_TO_PX);
  const mCm = s.match(/([\d.]+)\s*cm/i);
  if (mCm) return Math.round(parseFloat(mCm[1]) * (96 / 2.54));
  const mMm = s.match(/([\d.]+)\s*mm/i);
  if (mMm) return Math.round(parseFloat(mMm[1]) * (96 / 25.4));
  const mIn = s.match(/([\d.]+)\s*(in|inch)/i);
  if (mIn) return Math.round(parseFloat(mIn[1]) * 96);
  return null;
}

function getWidthFromStyle(style: string): number | null {
  if (!style) return null;
  const m = style.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
  return m ? toPx(m[1]) : null;
}

function computeMaxColumns(tableEl: HTMLTableElement): number {
  let max = 0;
  for (const tr of Array.from(tableEl.rows)) {
    let sum = 0;
    for (const td of Array.from(tr.cells)) {
      sum += parseInt(td.getAttribute("colspan") || "1", 10) || 1;
    }
    max = Math.max(max, sum);
  }
  return max;
}

function extractColWidths(tableEl: HTMLTableElement, maxCols: number): number[] {
  const cols = Array.from(tableEl.querySelectorAll("colgroup col, col"));
  if (cols.length) {
    const out = cols.slice(0, maxCols).map((col) => {
      const s = (col as HTMLElement).getAttribute("style") || "";
      const w = getWidthFromStyle(s);
      if (Number.isFinite(w)) return w;
      const wAttr = toPx((col as HTMLElement).getAttribute("width"));
      return Number.isFinite(wAttr) ? wAttr : null;
    });
    if (out.length === maxCols && out.every((n) => Number.isFinite(n))) return out as number[];
  }
  const firstRow = tableEl.rows[0];
  const tmp: (number | null)[] = new Array(maxCols).fill(null);
  if (firstRow) {
    let ci = 0;
    for (const cell of Array.from(firstRow.cells)) {
      const cs = parseInt(cell.getAttribute("colspan") || "1", 10) || 1;
      const w = getWidthFromStyle(cell.getAttribute("style") || "");
      if (Number.isFinite(w)) {
        const each = Math.max(1, Math.round(w! / cs));
        for (let k = 0; k < cs && ci + k < tmp.length; k++) tmp[ci + k] = each;
      }
      ci += cs;
    }
  }
  const guessedTotal =
    toPx(tableEl.getAttribute("width")) ||
    getWidthFromStyle(tableEl.getAttribute("style") || "") ||
    800;
  const fallbackEach = Math.max(60, Math.round(guessedTotal! / (maxCols || 1)));
  return tmp.map((v) => (Number.isFinite(v) ? v! : fallbackEach));
}

const BLOCK_TAGS = new Set([
  "p", "div", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "table", "thead", "tbody", "tr",
]);

const INLINE_EFFECT = (tag: string, el: HTMLElement): string => {
  const t = tag.toLowerCase();
  if (t === "b" || t === "strong") return "font-weight: bold;";
  if (t === "i" || t === "em") return "font-style: italic;";
  if (t === "u") return "text-decoration: underline;";
  if (t === "s" || t === "strike") return "text-decoration: line-through;";
  if (t === "sub") return "vertical-align: sub;";
  if (t === "sup") return "vertical-align: super;";
  if (t === "font") {
    const out: string[] = [];
    const color = el.getAttribute("color");
    const face = el.getAttribute("face");
    const size = el.getAttribute("size");
    if (color) out.push(`color: ${color};`);
    if (face) out.push(`font-family: ${face};`);
    if (size) {
      const px =
        size === "1"
          ? "10px"
          : size === "2"
            ? "12px"
            : size === "3"
              ? "14px"
              : size === "4"
                ? "16px"
                : size === "5"
                  ? "18px"
                  : size === "6"
                    ? "24px"
                    : "32px";
      out.push(`font-size: ${px};`);
    }
    return out.join(" ");
  }
  return "";
};

function getAlignStyleFromAttr(el: HTMLElement): string {
  const align = el.getAttribute?.("align");
  if (!align) return "";
  const v = String(align).toLowerCase();
  if (["left", "center", "right", "justify"].includes(v)) return `text-align: ${v};`;
  return "";
}

function getVAlignStyleFromAttr(el: HTMLElement): string {
  const valign = el.getAttribute?.("valign");
  if (!valign) return "";
  const v = String(valign).toLowerCase();
  return `vertical-align: ${v};`;
}

function styleToMap(style = ""): Map<string, string> {
  const m = new Map<string, string>();
  style
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const i = pair.indexOf(":");
      if (i < 0) return;
      m.set(pair.slice(0, i).trim().toLowerCase(), pair.slice(i + 1).trim());
    });
  return m;
}

function pickTextAlign(style = ""): string | null {
  const v = (styleToMap(style).get("text-align") || "").toLowerCase();
  return ["left", "right", "center", "justify"].includes(v) ? v : null;
}

function applyParagraphAlign(paragraph: ParagraphNode, styleOrFallback: string): void {
  const align = pickTextAlign(styleOrFallback);
  if (align) {
    try {
      paragraph.setFormat(align as any);
    } catch { /* empty */ }
  }
}

function isBlockTag(tag: string): boolean {
  return BLOCK_TAGS.has(tag.toLowerCase());
}

function computeStyleForElement(
  el: HTMLElement,
  byClass: Map<string, string>,
  byTag: Map<string, string>,
  inherited = "",
): string {
  const tag = el.tagName?.toLowerCase?.() || "";
  const tagRule = byTag.get(tag) || "";
  const classRule = (el.getAttribute?.("class") || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((cl) => byClass.get(cl) || "")
    .join("; ");
  const inline = el.getAttribute?.("style") || "";
  const tagFx = INLINE_EFFECT(tag, el);
  const alignAttr = getAlignStyleFromAttr(el);
  const vAlignAttr = getVAlignStyleFromAttr(el);
  return mergeStyles(inherited, tagRule, classRule, inline, tagFx, alignAttr, vAlignAttr);
}

function buildParagraphsFromCellDOM(
  cellEl: HTMLElement,
  byClass: Map<string, string>,
  byTag: Map<string, string>,
  cellStyleForFallback: string,
): ParagraphNode[] {
  const paras: ParagraphNode[] = [];
  let curP = $createParagraphNode();

  const flush = () => {
    if (curP.getChildrenSize() > 0) {
      if (!pickTextAlign((curP as any).getStyle?.() || "") && cellStyleForFallback) {
        applyParagraphAlign(curP, cellStyleForFallback);
      }
      paras.push(curP);
      curP = $createParagraphNode();
    }
  };

  const walk = (node: Node, inheritedStyle = "") => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.nodeValue ?? "").replace(/\r?\n/g, "");
      if (text) {
        const t = $createTextNode(text);
        if (typeof t.setStyle === "function") t.setStyle(inheritedStyle);
        curP.append(t);
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "br") {
        curP.append($createLineBreakNode());
        return;
      }

      const nextStyle = computeStyleForElement(el, byClass, byTag, inheritedStyle);

      if (isBlockTag(tag)) {
        flush();

        let blockP = $createParagraphNode();
        const blockAlign = pickTextAlign(nextStyle);
        if (blockAlign) applyParagraphAlign(blockP, nextStyle);
        else if (cellStyleForFallback) applyParagraphAlign(blockP, cellStyleForFallback);

        const pushBlockP = () => {
          if (blockP.getChildrenSize() > 0) {
            paras.push(blockP);
            blockP = $createParagraphNode();
            if (blockAlign) applyParagraphAlign(blockP, nextStyle);
            else if (cellStyleForFallback) applyParagraphAlign(blockP, cellStyleForFallback);
          }
        };

        const walkChildren = (container: Node, inhStyle: string) => {
          for (const child of Array.from(container.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
              const tx = (child.nodeValue ?? "").replace(/\r?\n/g, "");
              if (tx) {
                const t = $createTextNode(tx);
                if (typeof t.setStyle === "function") t.setStyle(inhStyle);
                blockP.append(t);
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const ktag = (child as HTMLElement).tagName.toLowerCase();
              if (ktag === "br") {
                blockP.append($createLineBreakNode());
              } else if (isBlockTag(ktag)) {
                pushBlockP();
                walk(child, computeStyleForElement(child as HTMLElement, byClass, byTag, inhStyle));
                pushBlockP();
              } else {
                const eff = computeStyleForElement(child as HTMLElement, byClass, byTag, inhStyle);
                for (const leaf of Array.from(child.childNodes)) {
                  if (leaf.nodeType === Node.TEXT_NODE) {
                    const tx2 = (leaf.nodeValue ?? "").replace(/\r?\n/g, "");
                    if (tx2) {
                      const t = $createTextNode(tx2);
                      if (typeof t.setStyle === "function") t.setStyle(eff);
                      blockP.append(t);
                    }
                  } else if (leaf.nodeType === Node.ELEMENT_NODE) {
                    const ltag = (leaf as HTMLElement).tagName.toLowerCase();
                    if (ltag === "br") blockP.append($createLineBreakNode());
                    else walk(leaf, eff);
                  }
                }
              }
            }
          }
        };

        walkChildren(el, nextStyle);
        if (blockP.getChildrenSize() > 0) paras.push(blockP);

        curP = $createParagraphNode();
        if (cellStyleForFallback) applyParagraphAlign(curP, cellStyleForFallback);
        return;
      }

      for (const child of Array.from(el.childNodes)) {
        walk(child, nextStyle);
      }
    }
  };

  for (const child of Array.from(cellEl.childNodes)) {
    walk(child, "");
  }
  flush();

  if (paras.length === 0) {
    if (cellStyleForFallback) applyParagraphAlign(curP, cellStyleForFallback);
    paras.push(curP);
  }
  return paras;
}

interface PasteTablePluginProps {
  editor: LexicalEditor;
}

export default function PasteTablePlugin({ editor }: PasteTablePluginProps) {
  useEffect(() => {
    const unregister = editor.registerCommand(
      PASTE_COMMAND,
      (e: ClipboardEvent) => {
        const html = e.clipboardData?.getData("text/html");
        const text = e.clipboardData?.getData("text/plain");

        // ---------- Case 1: Excel HTML ----------
        if (html && html.includes("<table")) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const tableEl = doc.querySelector("table");
          const styleEl = doc.querySelector("style");
          const { byClass, byTag } = parseCssRules(styleEl?.textContent || "");

          if (tableEl) {
            editor.update(() => {
              $insertLineBreakNode();

              const maxCols = computeMaxColumns(tableEl);
              const colWidths = extractColWidths(tableEl, maxCols);
              const totalW = colWidths.reduce((a, b) => a + b, 0);

              const tableStyle = mergeStyles(
                byTag.get("table") || "",
                (tableEl.getAttribute("class") || "")
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((cl) => byClass.get(cl) || "")
                  .join("; "),
                tableEl.getAttribute("style") || "",
                `table-layout: fixed; border-collapse: collapse; box-sizing: border-box; width: ${totalW}px;`,
              );

              const tableNode = new StyledTableNode(tableStyle);

              for (let r = 0; r < tableEl.rows.length; r++) {
                const rowEl = tableEl.rows[r];

                const trStyle = mergeStyles(
                  byTag.get("tr") || "",
                  (rowEl.getAttribute("class") || "")
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((cl) => byClass.get(cl) || "")
                    .join("; "),
                  rowEl.getAttribute("style") || "",
                  "box-sizing: border-box;",
                );
                const rowNode = new StyledTableRowNode(undefined, trStyle);

                let colCursor = 0;
                for (let c = 0; c < rowEl.cells.length; c++) {
                  const cellEl = rowEl.cells[c];

                  const cs = parseInt(cellEl.getAttribute("colspan") || "1", 10) || 1;
                  const rs = parseInt(cellEl.getAttribute("rowspan") || "1", 10) || 1;

                  const wSum = colWidths
                    .slice(colCursor, colCursor + cs)
                    .reduce((a, b) => a + b, 0);

                  const cellStyle = mergeStyles(
                    byTag.get(cellEl.tagName.toLowerCase()) || byTag.get("td") || "",
                    (cellEl.getAttribute("class") || "")
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((cl) => byClass.get(cl) || "")
                      .join("; "),
                    cellEl.getAttribute("style") || "",
                    getAlignStyleFromAttr(cellEl),
                    getVAlignStyleFromAttr(cellEl),
                    `width:${wSum}px; min-width:${wSum}px; box-sizing: border-box;`,
                  );

                  const isHeader = cellEl.tagName.toLowerCase() === "th";
                  const cellNode = new StyledTableCellNode(isHeader, cs, rs, cellStyle);

                  const paragraphs = buildParagraphsFromCellDOM(cellEl, byClass, byTag, cellStyle);
                  paragraphs.forEach((p) => cellNode.append(p));

                  rowNode.append(cellNode);
                  colCursor += cs;
                }

                tableNode.append(rowNode);
              }

              const sel = $getSelection();
              if ($isRangeSelection(sel)) sel.insertNodes([tableNode]);
              else $getRoot().append(tableNode);

              $insertLineBreakNode();
            });

            return true;
          }
        }

        // ---------- Case 2: TSV ----------
        if (text && text.includes("\t")) {
          const rows = text.split("\n");
          editor.update(() => {
            const tableNode = new StyledTableNode(
              "border-collapse: collapse; table-layout: fixed; width: 100%;",
            );

            rows.forEach((row) => {
              const rowNode = new StyledTableRowNode();
              row.split("\t").forEach((cellRaw) => {
                const cellNode = new StyledTableCellNode(false, 1, 1, "");
                if (cellRaw.length) {
                  const p = $createParagraphNode();
                  const parts = cellRaw.split(/\n/);
                  parts.forEach((chunk, i) => {
                    const t = $createTextNode(chunk);
                    p.append(t);
                    if (i < parts.length - 1) p.append($createLineBreakNode());
                  });
                  cellNode.append(p);
                } else {
                  cellNode.append($createParagraphNode());
                }
                rowNode.append(cellNode);
              });
              tableNode.append(rowNode);
            });

            const sel = $getSelection();
            if ($isRangeSelection(sel)) sel.insertNodes([tableNode]);
            else $getRoot().append(tableNode);
          });

          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );

    return () => unregister();
  }, [editor]);

  return null;
}
