import { useRef } from "react";
import { useEditorContext, useEditorLocale, VideoUploadIcon } from "@react-easy-editor/core";

import { $insertInlineVideoAtSelection } from "./VideoNode";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ChangeEvent, ReactNode } from "react";

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
        <VideoUploadIcon />
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
