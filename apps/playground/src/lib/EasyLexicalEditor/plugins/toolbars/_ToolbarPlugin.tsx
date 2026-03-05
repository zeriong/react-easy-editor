/**
 * ToolbarPlugin.tsx — Responsive (pack/unpack by Divider groups)
 * TypeScript
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ImageUploadToolbar from "./ImageUploadToolbar.tsx";
import UndoAndRedoToolbar from "./UndoAndRedoToolbar.tsx";
import TextStyleToolbar from "./TextStyleToolbar.tsx";
import BlockTypeToolbar from "./BlockTypeToolbar.tsx";
import TextColorToolbar from "./TextColorToolbar.tsx";
import TextBgColorToolbar from "./TextBgColorToolbar.tsx";
import AlignToolbar from "./AlignToolbar.tsx";
import VideoUploadToolbar from "./VideoUploadToolbar.tsx";
import useToolbarSingleTooltip from "../../hooks/useToolbarSingleTooltip.ts";

import type { LexicalEditor } from "lexical";
import type { ReactNode } from "react";

interface ToolbarPluginProps {
  textColors?: string[];
  textBgColors?: string[];
  saveServerFetcher?: (file: File) => Promise<string>;
  editor: LexicalEditor;
}

interface GroupProps {
  children: ReactNode;
}

interface GroupDef {
  key: string;
  nodes: ReactNode[];
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

export default function ToolbarPlugin({ textColors, textBgColors, saveServerFetcher, editor }: ToolbarPluginProps) {
  const TEXT_COLORS = useMemo(() => {
    return (
      textColors || ["#000000", "#FFFFFF", "#E11D48", "#2563EB", "#059669", "#F59E0B", "#64748B"]
    );
  }, [textColors]);

  const BG_COLORS = useMemo(() => {
    return textBgColors || ["transparent", "#FFF1F2", "#DBEAFE", "#ECFDF5", "#FEF3C7", "#F1F5F9"];
  }, [textBgColors]);

  const groups = useMemo<GroupDef[]>(
    () => [
      { key: "undo", nodes: [<UndoAndRedoToolbar key="undo" editor={editor} />] },
      { key: "style", nodes: [<TextStyleToolbar key="style" editor={editor} />] },
      { key: "align", nodes: [<AlignToolbar key="align" editor={editor} />] },
      {
        key: "block+colors",
        nodes: [
          <BlockTypeToolbar key="block" editor={editor} />,
          <TextColorToolbar key="textColor" editor={editor} textColors={TEXT_COLORS} />,
          <TextBgColorToolbar key="bgColor" editor={editor} bgColors={BG_COLORS} />,
        ],
      },
      {
        key: "media",
        nodes: [
          <ImageUploadToolbar key="img" editor={editor} saveServerFetcher={saveServerFetcher} />,
          <VideoUploadToolbar key="vid" editor={editor} saveServerFetcher={saveServerFetcher} />,
        ],
      },
    ],
    [editor, TEXT_COLORS, BG_COLORS, saveServerFetcher],
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
        {visible.map((g, i) => {
          return (
            <Group key={g.key}>
              {g.nodes}
              {i !== visible.length - 1 && <Divider />}
            </Group>
          );
        })}

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
