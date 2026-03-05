import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { UPDATE_IMAGE_SIZE_COMMAND } from "../../instance/index.ts";

import type { CSSProperties } from "react";
import type { LexicalEditor } from "lexical";

interface Size {
  width: number;
  height: number;
}

interface ResizableImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  lockAspectByDefault?: boolean;
  keepWithinParent?: boolean;
  nodeKey: string;
  onResize?: (size: Size) => void;
  onResizeEnd?: (size: Size) => void;
  editor: LexicalEditor;
}

interface DragState {
  handle: string;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  aspect: number | null;
  raf?: number;
}

export default function ResizableImage({
  src,
  alt,
  width,
  height,
  minWidth = 50,
  minHeight = 50,
  maxWidth = Infinity,
  maxHeight = Infinity,
  lockAspectByDefault = false,
  keepWithinParent = true,
  nodeKey,
  onResizeEnd,
  editor,
}: ResizableImageProps) {
  const HANDLER_POINT_CLASS_NAME = "easy_lexical_image_handle_point";

  const imgIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLSpanElement | null>(null);

  const dragState = useRef<DragState | null>(null);

  const isShiftPressedRef = useRef(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [isResizable, setIsResizable] = useState(false);

  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const sizeRef = useRef<Size>({ width: 0, height: 0 });

  const resizableSwitch = (event: PointerEvent) => {
    if ((event.target as HTMLElement).className === HANDLER_POINT_CLASS_NAME) {
      return;
    }

    if (imgIdRef.current === (event.target as HTMLElement).id) {
      setIsResizable(true);
    } else {
      setIsResizable(false);
    }
  };

  const clampSize = useCallback(
    (w: number, h: number): Size => {
      const parent = containerRef.current?.getBoundingClientRect();

      let maxW = maxWidth;
      let maxH = maxHeight;

      if (keepWithinParent && parent) {
        maxW = Math.min(maxW, parent.width);
        maxH = Math.min(maxH, parent.height);
      }

      const cw = Math.min(Math.max(w, minWidth), maxW);
      const ch = Math.min(Math.max(h, minHeight), maxH);
      return { width: cw, height: ch };
    },
    [keepWithinParent, maxWidth, maxHeight, minWidth, minHeight],
  );

  const applyResize = useCallback(
    (handle: string, dx: number, dy: number, lockAspect: boolean) => {
      const current = dragState.current;
      if (!current) return;

      let { startW, startH, aspect } = current;
      let w = startW;
      let h = startH;

      if (handle.includes("e")) w = startW + dx;
      if (handle.includes("w")) w = startW - dx;
      if (handle.includes("s")) h = startH + dy;
      if (handle.includes("n")) h = startH - dy;

      if (lockAspect && (aspect ?? naturalRatio)) {
        const ratio = (aspect ?? naturalRatio)!;
        if (handle === "e" || handle === "w") {
          h = w / ratio;
        } else if (handle === "n" || handle === "s") {
          w = h * ratio;
        } else {
          const byWidth = { width: w, height: w / ratio };
          const byHeight = { width: h * ratio, height: h };
          const chooseByWidth = Math.abs(w - startW) >= Math.abs(h - startH);
          ({ width: w, height: h } = chooseByWidth ? byWidth : byHeight);
        }
      }

      const clamped = clampSize(w, h);
      setSize(clamped);
      sizeRef.current = clamped;
    },
    [clampSize, naturalRatio],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      const handle = e.currentTarget.dataset.handle || "se";
      const frame = frameRef.current!;
      const startRect = frame.getBoundingClientRect();

      frame.setPointerCapture(e.pointerId);
      document.body.style.userSelect = "none";

      dragState.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startW: startRect.width,
        startH: startRect.height,
        aspect: naturalRatio,
      };

      const move = (ev: PointerEvent) => {
        const current = dragState.current;
        if (!current) return;
        const dx = ev.clientX - current.startX;
        const dy = ev.clientY - current.startY;

        if (current.raf) cancelAnimationFrame(current.raf);
        current.raf = requestAnimationFrame(() => {
          applyResize(current.handle, dx, dy, isShiftPressedRef.current || lockAspectByDefault);
        });
      };

      const up = () => {
        const current = dragState.current;
        if (!current) return;
        if (current.raf) cancelAnimationFrame(current.raf);
        dragState.current = null;
        document.body.style.userSelect = "";
        onResizeEnd?.(sizeRef.current);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      };

      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerup", up, { once: true });
      window.addEventListener("pointercancel", up, { once: true });
    },
    [applyResize, lockAspectByDefault, naturalRatio, onResizeEnd, size],
  );

  useEffect(() => {
    if (Number.isFinite(width) || Number.isFinite(height)) {
      setSize((prev) => {
        const next = {
          width: Number.isFinite(width) ? width! : prev.width,
          height: Number.isFinite(height) ? height! : prev.height,
        };
        if (next.width !== prev.width || next.height !== prev.height) {
          sizeRef.current = next;
          return next;
        }
        return prev;
      });
    }
  }, [width, height]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown, { passive: true });
    window.addEventListener("keyup", onKeyUp, { passive: true });

    window.addEventListener("pointerdown", resizableSwitch as EventListener, { passive: true });

    function createUniqueClassName() {
      const newId = `easy_lexical_image_${Date.now() + Math.random()}`;
      const isExists = document.getElementById(newId);
      if (!isExists) {
        imgIdRef.current = newId;
        imgRef.current!.id = newId;
        return;
      }
      createUniqueClassName();
    }
    createUniqueClassName();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", resizableSwitch as EventListener);
    };
  }, []);

  useLayoutEffect(() => {
    const img = new Image();
    img.src = src;
    img
      .decode?.()
      .catch(() => {})
      .finally(() => {
        const naturalW = img.naturalWidth || 0;
        const naturalH = img.naturalHeight || 0;

        const ratio = naturalW && naturalH ? naturalW / naturalH : null;

        setNaturalRatio(ratio);

        const rootEl = editor.getRootElement();
        const rootW = rootEl ? rootEl.clientWidth || rootEl.offsetWidth || naturalW || 800 : 800;

        let initWidth: number | undefined;
        let initHeight: number | undefined;

        if (!width && !height) {
          initWidth = Math.max(1, Math.round(rootW * 0.8));

          if (ratio) {
            initHeight = Math.max(1, Math.round(initWidth / ratio));
          } else {
            initHeight = Math.max(1, Math.round(initWidth * 0.666));
          }
        }

        sizeRef.current = { width: initWidth || width || 0, height: initHeight || height || 0 };
        setSize(sizeRef.current);

        editor.update(() => {
          editor.dispatchCommand(UPDATE_IMAGE_SIZE_COMMAND, {
            key: String(nodeKey),
            ...sizeRef.current,
          });
        });
      });
  }, [src]);

  return (
    <span
      ref={frameRef}
      style={{
        ...styles.frame,
        ...(isResizable ? styles.resizableFrame : {}),
        width: size.width,
        height: size.height,
      }}
    >
      <img ref={imgRef} src={src} alt={alt} style={styles.img} />

      {["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((h) => (
        <span
          key={`${h}_${Date.now()}`}
          data-handle={h}
          onPointerDown={onPointerDown}
          style={isResizable ? { ...styles.handleWrapper, ...handlePos[h] } : {}}
          className={HANDLER_POINT_CLASS_NAME}
        >
          <span style={isResizable ? { ...styles.handle } : {}} />
        </span>
      ))}
    </span>
  );
}

const styles: Record<string, CSSProperties> = {
  frame: {
    display: "block",
    maxWidth: "100%",
    position: "relative",
    boxSizing: "border-box",
    border: "1px solid transparent",
    touchAction: "none",
  },
  resizableFrame: {
    border: "1px dashed #64748b",
  },
  img: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  handleWrapper: {
    padding: "10px",
    position: "absolute",
    cursor: "nwse-resize",
    touchAction: "none",
  },
  handle: {
    width: 8,
    height: 8,
    display: "block",
    background: "#22d3ee",
  },
};

const handlePos: Record<string, CSSProperties> = {
  n: { top: -15, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
  s: { bottom: -15, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
  e: { right: -15, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
  w: { left: -15, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
  ne: { right: -15, top: -15, cursor: "nesw-resize" },
  nw: { left: -15, top: -15, cursor: "nwse-resize" },
  se: { right: -15, bottom: -15, cursor: "nwse-resize" },
  sw: { left: -15, bottom: -15, cursor: "nesw-resize" },
};
