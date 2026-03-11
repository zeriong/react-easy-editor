import { useEditorContext } from "../EditorContext";
import { useEditorLocale } from "../locale";
import { LoadingSpinnerIcon } from "../icons";
import FadeAnimate from "./FadeAnimate";

export default function LoadingCover() {
  const { isLoading } = useEditorContext();
  const { t } = useEditorLocale();

  return (
    <FadeAnimate isVisible={isLoading} className={"editor-loading-container"}>
      {isLoading && (
        <div className={"editor-loading-content"}>
          <div className="save-loading">
            <LoadingSpinnerIcon />
          </div>
          <p>{t("Compressing file...")}</p>
        </div>
      )}
    </FadeAnimate>
  );
}
