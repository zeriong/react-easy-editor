import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { renderToString } from "react-dom/server";

import type { ReactNode } from "react";

type ToastType = "success" | "warn" | "error";

interface Toast {
  message: string;
  type: ToastType;
}

interface AddToast {
  (message: string | ReactNode): void;
  success: (message: string | ReactNode) => void;
  warn: (message: string | ReactNode) => void;
  error: (message: string | ReactNode) => void;
}

interface ToastsStore {
  toasts: Toast[];
  addToast: AddToast;
  setToast: (messages: Toast[]) => void;
  removeToast: () => void;
  removeDuplicates: () => void;
}

export const useToastStore = create<ToastsStore>()(
  devtools((setState) => ({
    toasts: [],
    addToast: Object.assign(
      (message: string | ReactNode) => {
        setState((state) => ({
          toasts: [...state.toasts, { message: renderToString(message), type: "success" as const }],
        }));
      },
      {
        success: (message: string | ReactNode) => {
          setState((state) => ({
            toasts: [...state.toasts, { message: renderToString(message), type: "success" as const }],
          }));
        },
        warn: (message: string | ReactNode) => {
          setState((state) => ({
            toasts: [...state.toasts, { message: renderToString(message), type: "warn" as const }],
          }));
        },
        error: (message: string | ReactNode) => {
          setState((state) => ({
            toasts: [...state.toasts, { message: renderToString(message), type: "error" as const }],
          }));
        },
      },
    ) as AddToast,
    setToast: (messages: Toast[]) => {
      setState(() => ({ toasts: messages }));
    },
    removeToast: () =>
      setState((state) => {
        state.toasts.shift();
        return { toasts: [...state.toasts] };
      }),
    removeDuplicates: () => {
      setState((state) => {
        const convert = new Set(state.toasts);
        return { toasts: [...convert] };
      });
    },
  })),
);
