import { useEditorContext } from "../EditorContext";
import { LoadingSpinnerIcon } from "../icons";
import FadeAnimate from "./FadeAnimate";

export default function LoadingCover() {
  const { isLoading } = useEditorContext();

  return (
    <FadeAnimate isVisible={isLoading} className={"editor-loading-container"}>
      {isLoading && (
        <div className={"editor-loading-content"}>
          <div className="save-loading">
            <LoadingSpinnerIcon />
          </div>
        </div>
      )}
    </FadeAnimate>
  );
}
