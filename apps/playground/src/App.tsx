import { useRef, useState } from "react";

import {
  ReactEasyEditor,
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

import TestHeader from "./components/TestHeader";

import type {
  LexicalEditor,
  EditorState,
  SerializedEditorState,
} from "lexical";

interface EditorChangeData {
  editorState: EditorState;
  editor: LexicalEditor;
  text: string;
  html: string;
  json: SerializedEditorState;
}

const PLUGINS = [
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
  const editorRef = useRef<LexicalEditor | null>(null);

  const [contentList, setContentList] = useState<string[]>([]);
  const [latestData, setLatestData] = useState<EditorChangeData | null>(null);

  function onSubmit() {
    if (latestData) {
      setContentList((prev) => [...prev, latestData.html]);
    }
  }

  function allClear() {
    setContentList([]);
  }

  function popClear() {
    setContentList((prev) => prev.slice(0, -1));
  }

  return (
    <>
      <TestHeader
        onSubmit={onSubmit}
        allClear={allClear}
        popClear={popClear}
        editor={editorRef.current}
      />

      <div className="easy_lexical_test_container">
        <div className="easy_lexical_test_inner">
          <p className="easy_lexical_test_title">Hello!</p>

          <ReactEasyEditor
            plugins={PLUGINS}
            devTools
            onChange={setLatestData}
            onReady={(editor: LexicalEditor) => {
              editorRef.current = editor;
            }}
            language="kr"
          />

          {contentList.map((content, idx) => (
            <div
              key={"editor_content_" + idx}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
