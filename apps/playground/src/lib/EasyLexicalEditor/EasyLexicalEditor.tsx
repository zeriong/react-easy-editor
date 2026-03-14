/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "./styles/easy-lexical-editor.css";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import {
  $createParagraphNode,
  $getRoot,
  CLEAR_HISTORY_COMMAND,
  ParagraphNode,
  TextNode,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $generateHtmlFromNodes } from "@lexical/html";

import type { LexicalEditor, EditorState, SerializedEditorState } from "lexical";
import type { CSSProperties } from "react";

import TreeViewPlugin from "./plugins/test/TreeViewPlugin.tsx";

import { BasicTheme } from "./constants/common.ts";
import { ResizableImageNode } from "./nodes/ResizableImageNode.tsx";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import ImageDnDPlugin from "./plugins/image/ImageDnDPlugin.tsx";
import PasteImagePlugin from "./plugins/image/PasteImagePlugin.tsx";
import ResizableTablePlugin from "./plugins/table/ResizableTablePlugin.tsx";
import { buildInlineStyleImportMap } from "./utils/editorImporter.ts";
import { whitelistStylesExportDOM } from "./utils/editorExporter.ts";
import { StyledTableNode, StyledTableRowNode, StyledTableCellNode, PasteTableHandler } from "@react-easy-editor/table";
import LoadingCover from "./components/common/LoadingCover.tsx";
import { Toasts } from "./components/common/Toasts.tsx";
import { useEditorStore } from "./store/editorStore.ts";
import { useEffect, useRef, useState } from "react";
import { clearRefTimeout } from "./utils/common.ts";
import { ResizableVideoNode } from "./nodes/ResizableVideoNode.tsx";
import ToolbarPlugin from "./plugins/toolbars/_ToolbarPlugin.tsx";
import CaretColorPlugin from "./plugins/common/CaretColorPlugin.tsx";
import { toast } from "./instance/index.ts";

import type { EditorLocale } from "./store/editorStore.ts";

const exportMap = new Map([
  [ParagraphNode, whitelistStylesExportDOM],
  [TextNode, whitelistStylesExportDOM],
  [HeadingNode, whitelistStylesExportDOM],
  [QuoteNode, whitelistStylesExportDOM],
]);

interface EasyLexicalEditorProps {
  showTerminal?: boolean;
  placeholder?: string;
  onChange: (data: { editorState: EditorState; editor: LexicalEditor; text: string; html: string; json: SerializedEditorState }) => void;
  editorInnerStyle?: CSSProperties;
  editorInnerWidth?: string;
  editorInnerHeight?: string;
  saveServerFetcher?: (file: File) => Promise<string>;
  toastShowingDuration?: number;
  uploadFailMessage?: string;
  isToastAutoHidden?: boolean;
  textBgColors?: string[];
  textColors?: string[];
  onReady?: (editor: LexicalEditor) => void;
  language?: EditorLocale;
}

export default function EasyLexicalEditor({
  showTerminal,
  placeholder = "내용을 입력해주세요.",
  onChange,
  editorInnerStyle,
  editorInnerWidth,
  editorInnerHeight = "500px",
  saveServerFetcher,
  toastShowingDuration,
  uploadFailMessage = "업로드에 실패하였습니다, 관리자에게 문의해주세요.",
  isToastAutoHidden,
  textBgColors,
  textColors,
  onReady,
  language = "en",
}: EasyLexicalEditorProps) {
  const editorConfig = {
    html: {
      export: exportMap,
      import: buildInlineStyleImportMap(),
    },
    namespace: "Easy-Lexical-Editor",
    nodes: [
      ParagraphNode,
      TextNode,
      HeadingNode,
      QuoteNode,
      ResizableImageNode,
      ResizableVideoNode,
      StyledTableNode,
      StyledTableRowNode,
      StyledTableCellNode,
    ],
    onError(error: Error) {
      throw error;
    },
    theme: BasicTheme,
  };

  const MAX_RETRY = 4;

  const editorRef = useRef<LexicalEditor | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);

  const { setIsLoading, setLocale } = useEditorStore();

  const [notFoundEditor, setNotFoundEditor] = useState(false);
  const [isOnReady, setIsOnReady] = useState(false);

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
      clearRefTimeout(timeoutRef);
      timeoutRef.current = setTimeout(() => {
        checkReady();
      }, 1000);
    }
  }

  function handleChange(editorState: EditorState, editor: LexicalEditor) {
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
      toast.warn(uploadFailMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function registerEditorInstance(editor: LexicalEditor) {
    if (editor) {
      editorRef.current = editor;
      (editorRef.current as any).resetContent = () => {
        (editorRef.current as any).update(() => {
          const root = $getRoot();
          root.append($createParagraphNode());
          root.clear();
        });

        (editorRef.current as any).dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      };

      editorRef.current.update(() => {
        const root = $getRoot();
        root.append($createParagraphNode());
      });

      if (onReady) {
        onReady(editor);
      }
    }
  }

  useEffect(() => {
    setLocale(language);
    console.log("lang", language);
  }, [language]);

  useEffect(() => {
    checkReady();
  }, []);

  return !notFoundEditor ? (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: registerEditorInstance,
      }}
    >
      {editorRef.current && isOnReady && (
        <>
          <>
            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ResizableTablePlugin editor={editorRef.current} />
            <PasteTableHandler editor={editorRef.current} />
            <CaretColorPlugin editor={editorRef.current} />

            <ImageDnDPlugin
              editor={editorRef.current}
              saveServerFetcher={saveServerFetcher && handleSaveServerFetcher}
            />
            <PasteImagePlugin
              editor={editorRef.current}
              saveServerFetcher={saveServerFetcher && handleSaveServerFetcher}
            />
          </>

          <div className="editor-container">
            <ToolbarPlugin
              editor={editorRef.current}
              textBgColors={textBgColors}
              textColors={textColors}
              saveServerFetcher={saveServerFetcher && handleSaveServerFetcher}
            />

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
                    aria-placeholder={placeholder}
                    placeholder={<div className="editor-placeholder">{placeholder}</div>}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />

              <LoadingCover />

              <Toasts showingDuration={toastShowingDuration} isAutoHidden={isToastAutoHidden} />
            </div>

            {showTerminal && <TreeViewPlugin editor={editorRef.current} />}
          </div>
        </>
      )}
    </LexicalComposer>
  ) : (
    <div className={"editor-container"}>
      <div
        className="editor-inner not-found"
        style={{
          width: editorInnerWidth,
          height: editorInnerHeight,
          ...(editorInnerStyle || {}),
        }}
      >
        Failed to load editor( Editor instance does not exist ).
      </div>
    </div>
  );
}
