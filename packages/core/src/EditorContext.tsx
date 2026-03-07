import { createContext, useContext } from "react";
import type { LexicalEditor } from "lexical";
import type { EditorLocale, ToastAPI } from "./types";

export interface EditorContextValue {
  editor: LexicalEditor;
  locale: EditorLocale;
  toast: ToastAPI;
  saveServerFetcher?: (file: File) => Promise<string | null | undefined>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children, value }: { children: React.ReactNode; value: EditorContextValue }) {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used within <ReactEasyEditor />");
  return ctx;
}
