import { useEditorStore } from "../../store/editorStore.ts";
import FadeAnimate from "./FadeAnimate.tsx";

export default function LoadingCover() {
  const { isLoading } = useEditorStore();

  return (
    <FadeAnimate isVisible={isLoading} className={"editor-loading-container"}>
      {isLoading && (
        <div className={"editor-loading-content"}>
          <div className="save-loading" />
          <p>파일 압축중...</p>
        </div>
      )}
    </FadeAnimate>
  );
}
