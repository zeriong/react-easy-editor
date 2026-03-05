import type { Klass, LexicalNode, LexicalEditor } from "lexical";
import type { ReactNode } from "react";

export type EditorLocale = "en" | "kr" | "ja";

export interface ToastAPI {
  (message: string | ReactNode): void;
  success: (message: string | ReactNode) => void;
  warn: (message: string | ReactNode) => void;
  error: (message: string | ReactNode) => void;
}

export type ToolbarGroup = "undo" | "style" | "color" | "block" | "align" | "media";

export interface ToolbarRenderProps {
  editor: LexicalEditor;
}

export interface ToolbarItemConfig {
  group: ToolbarGroup;
  priority: number;
  render: (props: ToolbarRenderProps) => ReactNode;
}

export interface PluginConfig {
  name: string;
  nodes?: Klass<LexicalNode>[];
  toolbar?: ToolbarItemConfig | ToolbarItemConfig[];
  component?: React.ComponentType<{ editor: LexicalEditor }>;
  onInit?: (editor: LexicalEditor) => void;
}
