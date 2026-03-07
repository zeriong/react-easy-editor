import { useRef } from "react";
import { useEditorContext, useEditorLocale, toBase64 } from "@react-easy-editor/core";

import { $insertInlineImageAtSelection } from "./ImageNode";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ChangeEvent, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Inline SVG icon (image upload)                                     */
/* ------------------------------------------------------------------ */

function ImageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar render function                                            */
/* ------------------------------------------------------------------ */

export function InsertImageToolbarItem({ editor }: ToolbarRenderProps): ReactNode {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveServerFetcher, toast } = useEditorContext();
  const { t } = useEditorLocale();

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];
    if (!file || !file.type?.includes("image")) {
      toast.warn(t("Not an image file."));
      target.value = "";
      return;
    }

    let src: string | ArrayBuffer | null | undefined = null;
    try {
      src = saveServerFetcher ? await saveServerFetcher(file) : await toBase64(file);
    } finally {
      target.value = "";
    }
    if (!src) return;

    editor.update(() => {
      $insertInlineImageAtSelection({ src: src as string, alt: file.name || "" });
    });
  };

  return (
    <>
      <button
        onClick={onPickImage}
        className="toolbar-item spaced"
        aria-label={t("Insert Image")}
        data-tooltip={t("Insert Image")}
      >
        <ImageIcon />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFileChange}
      />
    </>
  );
}
