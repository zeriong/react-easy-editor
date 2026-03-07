import { ReactEasyEditor } from "@react-easy-editor/core";
import { ToolbarPlugin } from "@react-easy-editor/toolbar";
import { HistoryPlugin } from "@react-easy-editor/history";
import { TextStylePlugin } from "@react-easy-editor/text-style";
import { TextColorPlugin } from "@react-easy-editor/text-color";
import { AlignmentPlugin } from "@react-easy-editor/alignment";
import { BlockTypePlugin } from "@react-easy-editor/block-type";
import { ImagePlugin } from "@react-easy-editor/image";
import { VideoPlugin } from "@react-easy-editor/video";
import { TablePlugin } from "@react-easy-editor/table";

import type { CSSProperties } from "react";
import type { LexicalEditor, EditorState, SerializedEditorState } from "lexical";
import type { PluginConfig, EditorLocale } from "@react-easy-editor/core";

const DEFAULT_PLUGINS: PluginConfig[] = [
  ToolbarPlugin(),
  HistoryPlugin(),
  BlockTypePlugin(),
  TextStylePlugin(),
  TextColorPlugin(),
  AlignmentPlugin(),
  ImagePlugin(),
  VideoPlugin(),
  TablePlugin(),
];

export interface EasyEditorProps {
  /** Additional plugins to extend the editor beyond the built-in defaults */
  plugins?: PluginConfig[];
  /** Placeholder text shown when the editor is empty */
  placeholder?: string;
  /** Callback fired on every editor state change */
  onChange?: (data: {
    editorState: EditorState;
    editor: LexicalEditor;
    text: string;
    html: string;
    json: SerializedEditorState;
  }) => void;
  /** Custom inline styles for the editor inner container */
  editorInnerStyle?: CSSProperties;
  /** Width of the editor inner container */
  editorInnerWidth?: string;
  /** Height of the editor inner container */
  editorInnerHeight?: string;
  /** Server-side file upload handler; returns the URL of the uploaded file */
  saveServerFetcher?: (file: File) => Promise<string>;
  /** Duration in ms for toast notifications */
  toastShowingDuration?: number;
  /** Message shown when file upload fails */
  uploadFailMessage?: string;
  /** Whether toast notifications auto-hide */
  isToastAutoHidden?: boolean;
  /** Callback fired when the editor instance is ready */
  onReady?: (editor: LexicalEditor) => void;
  /** Editor UI language */
  language?: EditorLocale;
  /** Whether the editor auto-focuses on mount */
  autoFocus?: boolean;
}

export function EasyEditor({ plugins = [], ...rest }: EasyEditorProps) {
  return (
    <ReactEasyEditor
      plugins={[...DEFAULT_PLUGINS, ...plugins]}
      {...rest}
    />
  );
}
