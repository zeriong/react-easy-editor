import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

import type { LexicalEditor } from "lexical";

/**
 * Wrapper component that registers the Lexical HistoryPlugin.
 * This enables undo/redo keyboard shortcuts (Ctrl+Z / Ctrl+Y) and
 * command dispatching within the editor.
 *
 * Rendered by the plugin system as a sibling inside the LexicalComposer.
 */
export function HistoryPluginComponent(_props: { editor: LexicalEditor }) {
  return <HistoryPlugin />;
}
