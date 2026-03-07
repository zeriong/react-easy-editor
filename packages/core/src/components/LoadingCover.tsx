import { useEditorContext } from "../EditorContext";
import FadeAnimate from "./FadeAnimate";

export default function LoadingCover() {
  const { isLoading } = useEditorContext();

  return (
    <FadeAnimate isVisible={isLoading} className={"editor-loading-container"}>
      {isLoading && (
        <div className={"editor-loading-content"}>
          <div className="save-loading" />
        </div>
      )}
    </FadeAnimate>
  );
}
