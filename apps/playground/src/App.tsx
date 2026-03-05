import { useRef, useState } from "react";
import EasyLexicalEditor from "./lib/EasyLexicalEditor/EasyLexicalEditor.tsx";
import TestHeader from "./components/TestHeader.tsx";

import type { LexicalEditor } from "lexical";

const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;
const FILE_URL = import.meta.env.VITE_FILE_URL;

interface EditorProps {
  html: string;
  text: string;
  json: unknown;
  editorState: unknown;
  editor: LexicalEditor;
}

function App() {
  const editorRef = useRef<LexicalEditor | null>(null);

  const [contentList, setContentList] = useState<string[]>([]);
  const [getEditorProps, setGetEditorProps] = useState<EditorProps | null>(null);

  function allClear() {
    setContentList([]);
  }

  function popClear() {
    const deepCopy: string[] = JSON.parse(JSON.stringify(contentList));
    deepCopy.pop();
    setContentList(deepCopy);
  }

  function onSubmit() {
    console.log("서브밋", getEditorProps);
    setContentList((prev) => {
      return [...prev, getEditorProps!.html];
    });
  }

  const uploadEditorImageFilePastIpo = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    const imgRes = await fetch(URL.createObjectURL(file));
    const blobFile = await imgRes.blob();

    formData.append("uploadImage", blobFile, file.name);

    const accessToken = import.meta.env.VITE_ACCESS_TOKEN;

    const res = await fetch(UPLOAD_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: formData,
    });
    const resData = await res.json();
    const src = FILE_URL + resData.data;

    if (resData) {
      return src;
    }

    return null;
  };

  return (
    <>
      <TestHeader
        onSubmit={onSubmit}
        allClear={allClear}
        popClear={popClear}
        editor={editorRef.current}
      />

      <div className={"easy_lexical_test_container"}>
        <div className={"easy_lexical_test_inner"}>
          <p className={"easy_lexical_test_title"}>Hello!</p>

          <EasyLexicalEditor
            showTerminal
            // saveServerFetcher={uploadEditorImageFilePastIpo}
            onChange={setGetEditorProps}
            onReady={(editor) => {
              if (editor) {
                editorRef.current = editor;
                console.log("editor:", editor);
              }
            }}
            language={"kr"}
            // editorInnerInputHeight={"auto"}
          />
          {/*<EasyLexicalEditor onChange={setGetEditorProps} />*/}

          {contentList?.map((content, idx) => {
            return (
              <div key={"editor_content_" + idx} dangerouslySetInnerHTML={{ __html: content }} />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
