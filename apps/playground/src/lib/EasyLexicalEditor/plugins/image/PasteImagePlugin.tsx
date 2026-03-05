import { useEffect } from "react";
import { COMMAND_PRIORITY_LOW, PASTE_COMMAND } from "lexical";
import { insertInlineImageAtSelection } from "../../utils/insertInlineNode.ts";
import { toBase64 } from "../../utils/common.ts";

import type { LexicalEditor } from "lexical";

interface PasteImagePluginProps {
  editor: LexicalEditor;
  saveServerFetcher?: (file: File) => Promise<string>;
}

export default function PasteImagePlugin({ saveServerFetcher, editor }: PasteImagePluginProps) {
  useEffect(() => {
    const remove = editor.registerCommand(
      PASTE_COMMAND,
      (e: ClipboardEvent) => {
        const file = e.clipboardData?.files?.[0];
        if (!file || !file.type?.includes("image")) {
          return false;
        }

        e.preventDefault();
        (async () => {
          const src = saveServerFetcher ? await saveServerFetcher(file) : await toBase64(file);

          if (!src) return;
          editor.update(() => insertInlineImageAtSelection({ src: src as string, alt: file.name || "" }));
        })();

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => remove();
  }, [editor, saveServerFetcher]);

  return null;
}
