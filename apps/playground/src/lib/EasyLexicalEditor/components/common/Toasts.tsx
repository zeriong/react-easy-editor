import { useToastStore } from "../../store/toastStore.ts";
import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { clearRefTimeout } from "../../utils/common.ts";

import type { CSSProperties } from "react";

interface ToastsProps {
  containerStyle?: CSSProperties;
  showingDuration?: number;
  isAutoHidden?: boolean;
}

export const Toasts = ({ containerStyle = {}, showingDuration = 5000, isAutoHidden = true }: ToastsProps) => {
  const showStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toastDivRef = useRef<HTMLDivElement | null>(null);
  const prevMessage = useRef<string | null>(null);
  const isRunRef = useRef(false);

  const [iconClassName, setIconClassName] = useState("success");

  const toastStore = useToastStore();

  const hidden = () => {
    clearRefTimeout(showEndTimeoutRef);

    if (toastDivRef.current?.style) {
      toastDivRef.current.style.top = "0";
      toastDivRef.current.style.opacity = "0";
    }

    hiddenTimeoutRef.current = setTimeout(() => {
      if (toastDivRef.current?.style) {
        toastDivRef.current.style.display = "none";
      }

      if (useToastStore.getState().toasts.length !== 0) {
        useToastStore.getState().removeToast();
        show();
      } else {
        isRunRef.current = false;
      }
    }, 300);
  };

  const show = () => {
    useToastStore.getState().removeDuplicates();

    if (useToastStore.getState().toasts.some((msg) => msg.message === prevMessage.current)) {
      const filteredMessage = useToastStore
        .getState()
        .toasts.filter((msg) => msg.message !== prevMessage.current);
      useToastStore.getState().setToast(filteredMessage);
    }

    if (useToastStore.getState().toasts?.length > 0) {
      isRunRef.current = true;

      if (toastDivRef.current?.style) {
        toastDivRef.current.style.display = "flex";
        toastDivRef.current.style.top = "0";
        toastDivRef.current.style.opacity = "0";
      }

      console.log("Toasts! :", useToastStore.getState().toasts);

      prevMessage.current = useToastStore.getState().toasts[0]?.message;

      const toastType = useToastStore.getState().toasts[0]?.type;
      setIconClassName(toastType);

      showStartTimeoutRef.current = setTimeout(() => {
        if (toastDivRef.current?.style) {
          toastDivRef.current.style.top = "12px";
          toastDivRef.current.style.opacity = "1";
        }

        if (isAutoHidden) {
          showEndTimeoutRef.current = setTimeout(() => {
            hidden();
          }, showingDuration);
        }
      });
    } else {
      prevMessage.current = null;
      isRunRef.current = false;
    }
  };

  useEffect(() => {
    if (!isRunRef.current && useToastStore.getState().toasts?.length) {
      show();
    }
  }, [useToastStore.getState().toasts]);

  useEffect(() => {
    return () => {
      clearRefTimeout(showEndTimeoutRef);
      clearRefTimeout(showStartTimeoutRef);
      clearRefTimeout(hiddenTimeoutRef);
    };
  }, []);

  return (
    <div
      ref={toastDivRef}
      className={`editor-toast-container`}
      style={containerStyle}
      onClick={hidden}
    >
      {toastStore.toasts.length >= 0 && (
        <div className="editor-toast-content-wrapper">
          <i className={iconClassName} />
          <div
            className="editor-toast-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(toastStore.toasts[0]?.message),
            }}
          />
        </div>
      )}
    </div>
  );
};
