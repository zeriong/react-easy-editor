import { useRef } from "react";
import { useEditorContext, useEditorLocale, toBase64, ImageIcon } from "@react-easy-editor/core";

import { $insertInlineImageAtSelection } from "./ImageNode";

import type { ToolbarRenderProps } from "@react-easy-editor/core";
import type { ChangeEvent, ReactNode } from "react";

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
