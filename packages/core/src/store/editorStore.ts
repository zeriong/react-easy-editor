import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { EditorLocale } from "../types";

interface EditorStore {
  isLoading: boolean;
  locale: EditorLocale;
  setLocale: (locale: EditorLocale) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    (setState) => ({
      isLoading: false,
      locale: "en",

      setLocale: (locale) => {
        setState(() => ({ locale }));
      },
      setIsLoading: (isLoading) => {
        setState(() => ({ isLoading }));
      },
    }),
  ),
);
