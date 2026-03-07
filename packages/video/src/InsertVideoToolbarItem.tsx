import { useRef } from "react";
import { useEditorContext, useEditorLocale } from "@react-easy-editor/core";

import { $insertInlineVideoAtSelection } from "./VideoNode";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ChangeEvent, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Inline SVG icon (video/camera)                                     */
/* ------------------------------------------------------------------ */

function VideoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar render function                                            */
/* ------------------------------------------------------------------ */

export function InsertVideoToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveServerFetcher, toast } = useEditorContext();
  const { t } = useEditorLocale();

  const onPickVideo = () => fileInputRef.current?.click();

  const onFileChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];
    if (!file || !file.type?.includes("video")) {
      toast.warn(t("Not a video file."));
      target.value = "";
      return;
    }

    let src: string | null | undefined = null;
    try {
      src = saveServerFetcher
        ? await saveServerFetcher(file)
        : URL.createObjectURL(file);
    } finally {
      target.value = "";
    }
    if (!src) return;

    editor.update(() => {
      $insertInlineVideoAtSelection({
        src: src as string,
        poster: "",
        controls: true,
        muted: true,
        playsInline: true,
      });
    });
  };

  return (
    <>
      <button
        onClick={onPickVideo}
        className="toolbar-item spaced"
        aria-label={t("Insert Video")}
        data-tooltip={t("Insert Video")}
      >
        <VideoIcon />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={onFileChange}
      />
    </>
  );
}
