import { useEditorStore } from "../lib/EasyLexicalEditor/store/editorStore.ts";
import { toast } from "../lib/EasyLexicalEditor/instance/index.ts";
import { useEffect, useState } from "react";

import type { LexicalEditor } from "lexical";
import type { EditorLocale } from "../lib/EasyLexicalEditor/store/editorStore.ts";

interface TestHeaderProps {
  onSubmit: () => void;
  allClear: () => void;
  popClear: () => void;
  editor: (LexicalEditor & { resetContent?: () => void }) | null;
}

export default function TestHeader({ onSubmit, allClear, popClear, editor }: TestHeaderProps) {
  const { setIsLoading, isLoading, locale, setLocale } = useEditorStore();

  const [lang, setLang] = useState<EditorLocale>(locale);

  function editorExportDom() {
    console.log("editorExportDom: \n", editor);
  }

  function deleteEditorContent() {
    if (editor) {
      editor.resetContent?.();
    }
  }

  function onChangeLocale({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) {
    setLocale(value as EditorLocale);
  }

  useEffect(() => {
    setLang(locale);
  }, [locale]);

  return (
    <header className={"easy_lexical_test_header"}>
      <button className={"easy_lexical_test_button register"} type={"button"} onClick={onSubmit}>
        작성
      </button>

      <button
        className={"easy_lexical_test_button register"}
        type={"button"}
        onClick={allClear}
        style={{ backgroundColor: "red" }}
      >
        작성 전체 삭제
      </button>

      <button
        className={"easy_lexical_test_button register"}
        type={"button"}
        onClick={popClear}
        style={{ backgroundColor: "brown" }}
      >
        마지막 작성 삭제
      </button>

      <div
        className={"easy_lexical_test_button"}
        onClick={() => {
          setIsLoading(!isLoading);
        }}
      >
        로딩 띄우기 토글
      </div>
      <div
        className={"easy_lexical_test_button"}
        onClick={() => {
          toast.success("Success!");
        }}
      >
        성공 토스트
      </div>
      <div
        className={"easy_lexical_test_button"}
        onClick={() => {
          toast.warn(`업로드에 실패하였습니다, 관리자에게 문의해주세요.`);
        }}
      >
        경고 토스트
      </div>
      <div
        className={"easy_lexical_test_button"}
        onClick={() => {
          toast.error("Error!");
        }}
      >
        에러 토스트
      </div>
      <div className={"easy_lexical_test_button register"} onClick={deleteEditorContent}>
        에디터 초기화
      </div>
      <div className={"easy_lexical_test_button register"} onClick={editorExportDom}>
        에디터 DOM
      </div>

      <div className={"easy_lexical_test_button"} style={{ display: "flex", gap: "8px" }}>
        lang:
        <select className={"easy_lexical_test_button"} value={lang} onChange={onChangeLocale}>
          <option value="en">EN</option>
          <option value="kr">KR</option>
          <option value="ja">JA</option>
        </select>
      </div>
    </header>
  );
}
