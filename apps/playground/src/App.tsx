import { useState } from "react";

import {
  // All-in-one component
  EasyEditor,
  // Core component for custom plugin composition
  ReactEasyEditor,
  // Individual plugins
  ToolbarPlugin,
  HistoryPlugin,
  TextStylePlugin,
  TextColorPlugin,
  AlignmentPlugin,
  BlockTypePlugin,
  ImagePlugin,
  VideoPlugin,
  TablePlugin,
} from "react-easy-editor";

import type { LexicalEditor, EditorState, SerializedEditorState } from "lexical";

// ── onChange payload type ──
interface EditorChangeData {
  editorState: EditorState;
  editor: LexicalEditor;
  text: string;
  html: string;
  json: SerializedEditorState;
}

// ── Example: Custom plugin composition ──
const CUSTOM_PLUGINS = [
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

function App() {
  const [mode, setMode] = useState<"all-in-one" | "custom">("all-in-one");
  const [contentList, setContentList] = useState<string[]>([]);
  const [latestData, setLatestData] = useState<EditorChangeData | null>(null);

  function handleChange(data: EditorChangeData) {
    setLatestData(data);
  }

  function onSubmit() {
    if (latestData) {
      setContentList((prev) => [...prev, latestData.html]);
    }
  }

  function clearAll() {
    setContentList([]);
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <h1>react-easy-editor Playground</h1>

      {/* ── Mode selector ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setMode("all-in-one")}
          style={{
            padding: "8px 16px",
            fontWeight: mode === "all-in-one" ? "bold" : "normal",
            background: mode === "all-in-one" ? "#1677ff" : "#f0f0f0",
            color: mode === "all-in-one" ? "#fff" : "#333",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          All-in-one (EasyEditor)
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          style={{
            padding: "8px 16px",
            fontWeight: mode === "custom" ? "bold" : "normal",
            background: mode === "custom" ? "#1677ff" : "#f0f0f0",
            color: mode === "custom" ? "#fff" : "#333",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Custom (ReactEasyEditor + plugins)
        </button>
      </div>

      {/* ── Editor area ── */}
      <div style={{ marginBottom: 16 }}>
        {mode === "all-in-one" ? (
          <>
            <h2>EasyEditor (All-in-one)</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
              All plugins are included by default. Just drop it in and start editing.
            </p>
            <EasyEditor
              onChange={handleChange}
              language="en"
              placeholder="Start typing with all plugins enabled..."
            />
          </>
        ) : (
          <>
            <h2>ReactEasyEditor (Custom plugins)</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
              Choose exactly which plugins to include via the <code>plugins</code> prop.
            </p>
            <ReactEasyEditor
              plugins={CUSTOM_PLUGINS}
              onChange={handleChange}
              language="en"
              placeholder="Start typing with custom plugin setup..."
            />
          </>
        )}
      </div>

      {/* ── Submit & output area ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={onSubmit}
          style={{
            padding: "8px 16px",
            background: "#52c41a",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Submit (capture HTML)
        </button>
        <button
          type="button"
          onClick={clearAll}
          style={{
            padding: "8px 16px",
            background: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Clear all outputs
        </button>
      </div>

      {contentList.length > 0 && (
        <div>
          <h3>Submitted content</h3>
          {contentList.map((content, idx) => (
            <div
              key={"editor_content_" + idx}
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                padding: 12,
                marginBottom: 8,
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
