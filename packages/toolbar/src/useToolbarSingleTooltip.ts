import { useEffect, useRef } from "react";
import { useEditorLocale, useEditorStore } from "@react-easy-editor/core";

import type { RefObject } from "react";

export default function useToolbarSingleTooltip(toolbarRef: RefObject<HTMLDivElement | null>): void {
  const tipRef = useRef<HTMLDivElement | null>(null);
  const currentBtn = useRef<HTMLElement | null>(null);

  const { locale } = useEditorStore();
  const { t } = useEditorLocale();

  const ensureTip = (): HTMLDivElement => {
    if (!tipRef.current) {
      const tip = document.createElement("div");
      tip.className = "tb-tooltip";
      const arrow = document.createElement("div");
      arrow.className = "tb-tooltip__arrow";
      tip.appendChild(arrow);
      toolbarRef.current!.appendChild(tip);
      tipRef.current = tip;
    }
    return tipRef.current;
  };

  const setText = (text: string): void => {
    const tip = ensureTip();
    if (tip.firstChild && (tip.firstChild as HTMLElement).className !== "tb-tooltip__arrow") {
      tip.removeChild(tip.firstChild);
    }
    tip.insertBefore(document.createTextNode(text), tip.firstChild || null);
  };

  const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

  const positionUnder = (btn: HTMLElement): void => {
    const tip = ensureTip();
    const arrowEl = tip.querySelector<HTMLElement>(".tb-tooltip__arrow");

    const prevVis = tip.style.visibility;
    tip.style.visibility = "hidden";
    tip.setAttribute("data-show", "1");

    const contRect = toolbarRef.current!.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const containerW = contRect.width;
    const pad = 8;
    const arrowPad = 10;

    const anchorCenter = btnRect.left + btnRect.width / 2 - contRect.left;

    const tipW = Math.ceil(tip.getBoundingClientRect().width) || 0;

    const minCenter = pad + tipW / 2;
    const maxCenter = containerW - pad - tipW / 2;
    const clampedCenter = clamp(anchorCenter, minCenter, maxCenter);

    tip.style.left = `${Math.round(clampedCenter)}px`;

    const dx = anchorCenter - clampedCenter;
    let arrowX = tipW / 2 + dx;
    arrowX = clamp(arrowX, arrowPad, tipW - arrowPad);

    if (arrowEl) {
      arrowEl.style.left = `${Math.round(arrowX)}px`;
    }
    tip.style.setProperty("--arrow-x", `${Math.round(arrowX)}px`);

    tip.style.visibility = prevVis || "";
  };

  const showFor = (btn: HTMLElement): void => {
    const label = btn.getAttribute("aria-label");
    if (!label) return;

    setText(t(label));
    positionUnder(btn);
    ensureTip().setAttribute("data-show", "1");
    currentBtn.current = btn;
  };

  const hide = (): void => {
    const tip = tipRef.current;
    if (tip) tip.removeAttribute("data-show");
    currentBtn.current = null;
  };

  useEffect(() => {
    const root = toolbarRef.current;
    if (!root) return;

    const findBtn = (t: EventTarget | null): HTMLElement | null =>
      (t as HTMLElement)?.closest?.(".toolbar-item,[data-tooltip],[aria-label]") ?? null;

    const onOver = (e: MouseEvent): void => {
      const btn = findBtn(e.target);
      if (!btn || !root.contains(btn)) return;
      if (btn === currentBtn.current) return;
      showFor(btn);
    };

    const onOut = (e: MouseEvent): void => {
      const from = findBtn(e.target);
      const to = findBtn(e.relatedTarget);
      if (from && from !== to) hide();
    };

    const onFocus = (e: FocusEvent): void => {
      const btn = findBtn(e.target);
      if (btn && root.contains(btn)) showFor(btn);
    };

    const onBlur = hide;
    const onResizeOrScroll = (): void => {
      if (currentBtn.current) positionUnder(currentBtn.current);
    };

    root.addEventListener("mouseover", onOver as EventListener, true);
    root.addEventListener("mouseout", onOut as EventListener, true);
    root.addEventListener("focusin", onFocus as EventListener);
    root.addEventListener("focusout", onBlur);
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);

    return () => {
      root.removeEventListener("mouseover", onOver as EventListener, true);
      root.removeEventListener("mouseout", onOut as EventListener, true);
      root.removeEventListener("focusin", onFocus as EventListener);
      root.removeEventListener("focusout", onBlur);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
      if (tipRef.current) {
        tipRef.current.remove();
        tipRef.current = null;
      }
    };
  }, [toolbarRef, locale]);
}
