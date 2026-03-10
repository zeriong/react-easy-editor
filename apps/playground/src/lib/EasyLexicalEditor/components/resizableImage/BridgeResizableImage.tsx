import ResizableImage from "./ResizableImage.tsx";
import { UPDATE_IMAGE_SIZE_COMMAND } from "../../instance/index.ts";

import type { LexicalEditor } from "lexical";

interface BridgeResizableImageProps {
  editor: LexicalEditor;
  nodeKey: string;
  src: string;
  alt: string;
  width: number | undefined;
  height: number | undefined;
}

export default function BridgeResizableImage({
  editor,
  nodeKey,
  src,
  alt,
  width,
  height,
}: BridgeResizableImageProps) {
  return (
    <ResizableImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      editor={editor}
      nodeKey={nodeKey}
      onResizeEnd={(s) => {
        editor.update(
          () => {
            editor.dispatchCommand(UPDATE_IMAGE_SIZE_COMMAND, {
              key: String(nodeKey),
              width: s.width,
              height: s.height,
            });
          },
          { discrete: true },
        );
      }}
    />
  );
}
