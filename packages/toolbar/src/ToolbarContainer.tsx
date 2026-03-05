/**
 * ToolbarContainer.tsx — Responsive toolbar (pack/unpack by Divider groups)
 *
 * Reads ToolbarItemConfig[] from ToolbarContext and renders them
 * dynamically grouped. Supports responsive packing/unpacking via
 * ResizeObserver with a "More" overflow button.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEditorContext, useToolbarItems } from "@react-easy-editor/core";
import useToolbarSingleTooltip from "./useToolbarSingleTooltip";

import type { ReactNode } from "react";
import type { ToolbarGroup, ToolbarItemConfig } from "@react-easy-editor/core";
import type { LexicalEditor } from "lexical";

const GROUP_ORDER: ToolbarGroup[] = ["undo", "style", "color", "block", "align", "media"];

interface GroupDef {
  key: string;
  nodes: ReactNode[];
}

interface GroupProps {
  children: ReactNode;
}

function Divider() {
  return <div className="divider" aria-hidden="true" data-measure="divider" />;
}

function Group({ children }: GroupProps) {
  return (
    <div className="tb-group" data-measure="group">
      {children}
    </div>
  );
}

function buildGroups(items: ToolbarItemConfig[], editor: LexicalEditor): GroupDef[] {
  const map = new Map<ToolbarGroup, ToolbarItemConfig[]>();

  for (const item of items) {
    let list = map.get(item.group);
    if (!list) {
      list = [];
      map.set(item.group, list);
    }
    list.push(item);
  }

  const groups: GroupDef[] = [];
  for (const groupKey of GROUP_ORDER) {
    const list = map.get(groupKey);
    if (!list || list.length === 0) continue;

    // Sort items within group by priority
    const sorted = [...list].sort((a, b) => a.priority - b.priority);

    groups.push({
      key: groupKey,
      nodes: sorted.map((item, idx) => (
        <span key={`${groupKey}-${idx}`}>
          {item.render({ editor })}
        </span>
      )),
    });
  }

  return groups;
}

export function ToolbarContainer({ editor }: { editor: LexicalEditor }) {
  const items = useToolbarItems();
  const editorCtx = useEditorContext();

  // Use editor from props (passed by ReactEasyEditor plugin rendering) or context
  const activeEditor = editor || editorCtx.editor;

  const groups = useMemo(
    () => buildGroups(items, activeEditor),
    [items, activeEditor],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreBtnMeasureRef = useRef<HTMLButtonElement>(null);

  useToolbarSingleTooltip(containerRef);

  const [groupWidths, setGroupWidths] = useState<number[]>([]);
  const [dividerWidth, setDividerWidth] = useState(0);
  const [moreWidth, setMoreWidth] = useState(28);

  const [visibleCount, setVisibleCount] = useState(groups.length);
  const [showPopover, setShowPopover] = useState(false);

  useLayoutEffect(() => {
    const meas = measureRef.current;
    if (!meas) return;

    const nodes = [...meas.querySelectorAll('[data-measure="group"]')];
    const widths = nodes.map((el) => Math.ceil(el.getBoundingClientRect().width));
    setGroupWidths(widths);

    const divEl = meas.querySelector('[data-measure="divider"]');
    if (divEl) {
      const dividerStyles = window.getComputedStyle(divEl);
      const { width, marginRight, marginLeft, paddingLeft, paddingRight } = dividerStyles;
      const convertNums = [width, marginRight, marginLeft, paddingLeft, paddingRight].map(
        (v) => +v.replace("px", ""),
      );
      setDividerWidth(Math.ceil(convertNums.reduce((a, c) => a + c, 0)));
    }

    if (moreBtnMeasureRef.current) {
      const r = moreBtnMeasureRef.current.getBoundingClientRect();
      setMoreWidth(Math.ceil(r.width));
    }
  }, [groups.length]);

  useEffect(() => {
    if (!containerRef.current || groupWidths.length !== groups.length) return;

    const el = containerRef.current;

    const compute = () => {
      const W = Math.floor(el.clientWidth);
      const n = groups.length;

      let used = 0;
      let count = 0;

      for (let i = 0; i < n; i++) {
        const wGroup = groupWidths[i];
        const addDivider = i > 0 ? dividerWidth : 0;
        const blockWidth = wGroup + addDivider;

        const needMore = i < n - 1;
        const limit = needMore ? W - moreWidth : W;

        if (used + blockWidth <= limit) {
          used += blockWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(count);
      if (count === n) setShowPopover(false);
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(compute);
    });
    ro.observe(el);
    compute();

    const onWin = () => requestAnimationFrame(compute);
    window.addEventListener("resize", onWin);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
  }, [groups.length, groupWidths, dividerWidth, moreWidth]);

  useEffect(() => {
    const pressESC = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPopover(false);
      }
    };
    window.addEventListener("keydown", pressESC);
    return () => {
      window.removeEventListener("keydown", pressESC);
    };
  }, []);

  const hasOverflow = visibleCount < groups.length;
  const visible = groups.slice(0, visibleCount);
  const overflow = hasOverflow ? groups.slice(visibleCount) : [];

  return (
    <div className="toolbar-container">
      <div className="toolbar" ref={containerRef} role="toolbar">
        {visible.map((g, i) => (
          <Group key={g.key}>
            {g.nodes}
            {i !== visible.length - 1 && <Divider />}
          </Group>
        ))}

        {hasOverflow && (
          <div style={{ position: "relative" }}>
            <button
              className="toolbar-item spaced"
              aria-haspopup="menu"
              aria-expanded={showPopover}
              aria-label="More"
              onClick={() => setShowPopover((s) => !s)}
            >
              <i className="format more"></i>
            </button>

            {showPopover && hasOverflow && (
              <div role="menu" className="toolbar-popover">
                {overflow.map((g) => (
                  <Group key={`ov-${g.key}`}>{g.nodes}</Group>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden mirror div for measuring group widths */}
      <div ref={measureRef} aria-hidden="true" className="toolbar mirror">
        {groups.map((g) => (
          <Group key={`m-${g.key}`}>
            {g.nodes}
          </Group>
        ))}

        <Divider />

        <button ref={moreBtnMeasureRef} className="toolbar-item spaced">
          <i className="format more"></i>
        </button>
      </div>
    </div>
  );
}
