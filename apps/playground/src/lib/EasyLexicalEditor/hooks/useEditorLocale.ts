import { useCallback } from "react";
import { useEditorStore } from "../store/editorStore.ts";
import { LOCALE } from "../locale/index.ts";

export default function useEditorLocale() {
  const { locale } = useEditorStore();

  const t = useCallback(
    (content: string): string => {
      return LOCALE[locale]?.[content] || content;
    },
    [locale],
  );

  return { t };
}
