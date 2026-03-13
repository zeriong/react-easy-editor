/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { TreeView } from "@lexical/react/LexicalTreeView";

import {
  $createParagraphNode,
  $getRoot,
  CLEAR_HISTORY_COMMAND,
  ParagraphNode,
  TextNode,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $generateHtmlFromNodes } from "@lexical/html";

import { useEffect, useMemo, useRef, useState } from "react";

import { BasicTheme } from "./theme";
import { buildInlineStyleImportMap } from "./utils/editorImporter";
import { whitelistStylesExportDOM } from "./utils/editorExporter";
import { clearRefTimeout } from "./utils/common";
import { useEditorStore } from "./store/editorStore";
import { useToastStore } from "./store/toastStore";

import LoadingCover from "./components/LoadingCover";
import { Toasts } from "./components/Toasts";
import { CaretColorPlugin } from "./plugins/CaretColorPlugin";

import { EditorProvider } from "./EditorContext";
import { ToolbarProvider } from "./ToolbarContext";
import { LOCALE } from "./locale";

import type { LexicalEditor, EditorState, SerializedEditorState, Klass, LexicalNode, DOMExportOutput } from "lexical";
import type { CSSProperties } from "react";
import type { PluginConfig, ToolbarItemConfig, EditorLocale, EasyEditorInstance } from "./types";

type ExportFn = (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput;

const BASE_EXPORT_MAP = new Map<Klass<LexicalNode>, ExportFn>([
  [ParagraphNode, whitelistStylesExportDOM],
  [TextNode, whitelistStylesExportDOM],
  [HeadingNode, whitelistStylesExportDOM],
  [QuoteNode, whitelistStylesExportDOM],
]);

const BASE_NODES: Klass<LexicalNode>[] = [
  ParagraphNode,
  TextNode,
  HeadingNode,
  QuoteNode,
];

const GROUP_ORDER: Record<string, number> = {
  undo: 0,
  style: 1,
  align: 2,
  block: 3,
  media: 4,
};

interface ReactEasyEditorProps {
  plugins?: PluginConfig[];
  placeholder?: string;
  onChange?: (data: {
    editorState: EditorState;
    editor: LexicalEditor;
    text: string;
    html: string;
    json: SerializedEditorState;
  }) => void;
  editorInnerStyle?: CSSProperties;
  editorInnerWidth?: string;
  editorInnerHeight?: string;
  saveServerFetcher?: (file: File) => Promise<string>;
  toastShowingDuration?: number;
  uploadFailMessage?: string;
  isToastAutoHidden?: boolean;
  onReady?: (editor: LexicalEditor) => void;
  language?: EditorLocale;
  autoFocus?: boolean;
  devTools?: boolean;
}

export function ReactEasyEditor({
  plugins = [],
  placeholder,
  onChange,
  editorInnerStyle,
  editorInnerWidth,
  editorInnerHeight = "500px",
  saveServerFetcher,
  toastShowingDuration,
  uploadFailMessage,
  isToastAutoHidden,
  onReady,
  language = "en",
  autoFocus = true,
  devTools = false,
}: ReactEasyEditorProps) {
  // Resolve locale-aware defaults
  const resolvedPlaceholder = placeholder ?? LOCALE[language]?.placeholder ?? "Enter your content...";
  const resolvedUploadFailMessage = uploadFailMessage ?? LOCALE[language]?.uploadFail ?? "Upload failed. Please contact your administrator.";
  // Collect nodes from all plugins and merge with base nodes
  const allNodes = useMemo(() => {
    const pluginNodes = plugins.flatMap((p) => p.nodes || []);
    const nodeSet = new Set<Klass<LexicalNode>>([...BASE_NODES, ...pluginNodes]);
    return [...nodeSet];
  }, [plugins]);

  // Collect and sort toolbar items from all plugins
  const toolbarItems = useMemo(() => {
    const items: ToolbarItemConfig[] = [];
    for (const plugin of plugins) {
      if (plugin.toolbar) {
        if (Array.isArray(plugin.toolbar)) {
          items.push(...plugin.toolbar);
        } else {
          items.push(plugin.toolbar);
        }
      }
    }
    return items.sort((a, b) => {
      const groupDiff = (GROUP_ORDER[a.group] ?? 99) - (GROUP_ORDER[b.group] ?? 99);
      if (groupDiff !== 0) return groupDiff;
      return a.priority - b.priority;
    });
  }, [plugins]);

  const editorConfig = useMemo(
    () => ({
      html: {
        export: BASE_EXPORT_MAP,
        import: buildInlineStyleImportMap(),
      },
      namespace: "React-Easy-Editor",
      nodes: allNodes,
      onError(error: Error) {
        throw error;
      },
      theme: BasicTheme,
    }),
    [allNodes],
  );

  const MAX_RETRY = 4;

  const editorRef = useRef<LexicalEditor | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);

  const { setIsLoading, setLocale } = useEditorStore();

  const [notFoundEditor, setNotFoundEditor] = useState(false);
  const [isOnReady, setIsOnReady] = useState(false);

  const toast = useToastStore.getState().addToast;

  function checkReady() {
    const isMax = countRef.current >= MAX_RETRY;
    if (isMax || editorRef.current) {
      clearRefTimeout(timeoutRef);
      if (editorRef.current) {
        setIsOnReady(true);
      } else if (isMax) {
        setNotFoundEditor(true);
      }
      return;
    }
    if (!editorRef.current) {
      countRef.current += 1;
      clearRefTimeout(timeoutRef);
      timeoutRef.current = setTimeout(() => {
        checkReady();
      }, 1000);
    }
  }

  function handleChange(editorState: EditorState, editor: LexicalEditor) {
    if (!onChange) return;
    editorState.read(() => {
      const text = $getRoot().getTextContent();
      const html = $generateHtmlFromNodes(editor, null);
      const json = editorState.toJSON();
      onChange({ editorState, editor, text, html, json });
    });
  }

  async function handleSaveServerFetcher(file: File): Promise<string | null | undefined> {
    try {
      setIsLoading(true);
      const saveUrl = await saveServerFetcher!(file);
      if (saveUrl) {
        return saveUrl;
      }
    } catch (e) {
      console.error("save server error: ", e);
      toast.warn(resolvedUploadFailMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function registerEditorInstance(editor: LexicalEditor) {
    if (editor) {
      editorRef.current = editor;
      (editorRef.current as EasyEditorInstance).resetContent = () => {
        editorRef.current!.update(() => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        });

        editorRef.current!.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      };

      editorRef.current.update(() => {
        const root = $getRoot();
        root.append($createParagraphNode());
      });

      // Call onInit for each plugin
      for (const plugin of plugins) {
        if (plugin.onInit) {
          plugin.onInit(editor);
        }
      }

      if (onReady) {
        onReady(editor);
      }
    }
  }

  useEffect(() => {
    checkReady();
  }, []);

  // Sync language prop to global store (origin pattern)
  useEffect(() => {
    setLocale(language);
  }, [language, setLocale]);

  const storeIsLoading = useEditorStore((s) => s.isLoading);
  const storeLocale = useEditorStore((s) => s.locale);

  const editorContextValue = useMemo(
    () =>
      editorRef.current
        ? {
            editor: editorRef.current,
            locale: storeLocale,
            toast,
            saveServerFetcher: saveServerFetcher ? handleSaveServerFetcher : undefined,
            isLoading: storeIsLoading,
            setIsLoading,
          }
        : null,
    [editorRef.current, storeLocale, storeIsLoading, saveServerFetcher],
  );

  return !notFoundEditor ? (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: registerEditorInstance,
      }}
    >
      {editorRef.current && isOnReady && editorContextValue && (
        <EditorProvider value={editorContextValue}>
          <ToolbarProvider items={toolbarItems}>
            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />
            {autoFocus && <AutoFocusPlugin />}

            {/* Built-in plugins */}
            <CaretColorPlugin />

            <div className="editor-container">
              {/* Render plugin components (toolbar, etc.) inside editor-container for CSS scoping */}
              {plugins.map(
                (plugin) =>
                  plugin.component && (
                    <plugin.component key={plugin.name} editor={editorRef.current!} />
                  ),
              )}
              <div
                className="editor-inner"
                style={{
                  width: editorInnerWidth,
                  height: editorInnerHeight,
                  ...(editorInnerStyle || {}),
                }}
              >
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="editor-input"
                      aria-placeholder={resolvedPlaceholder}
                      placeholder={<div className="editor-placeholder">{resolvedPlaceholder}</div>}
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />

                <LoadingCover />

                <Toasts showingDuration={toastShowingDuration} isAutoHidden={isToastAutoHidden} />
              </div>

              {devTools && editorRef.current && (
                <TreeView
                  viewClassName="tree-view-output"
                  treeTypeButtonClassName="debug-treetype-button"
                  timeTravelPanelClassName="debug-timetravel-panel"
                  timeTravelButtonClassName="debug-timetravel-button"
                  timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
                  timeTravelPanelButtonClassName="debug-timetravel-panel-button"
                  editor={editorRef.current}
                />
              )}
            </div>
          </ToolbarProvider>
        </EditorProvider>
      )}
    </LexicalComposer>
  ) : (
    <div className="editor-container">
      <div
        className="editor-inner not-found"
        style={{
          width: editorInnerWidth,
          height: editorInnerHeight,
          ...(editorInnerStyle || {}),
        }}
      >
        Failed to load editor (Editor instance does not exist).
      </div>
    </div>
  );
}
