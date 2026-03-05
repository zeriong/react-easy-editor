import ResizableVideo from "./ResizableVideo.tsx";
import { UPDATE_VIDEO_SIZE_COMMAND } from "../../instance/index.ts";

import type { LexicalEditor } from "lexical";

interface BridgeResizableVideoProps {
  editor: LexicalEditor;
  nodeKey: string;
  src: string;
  poster: string;
  width: number | undefined;
  height: number | undefined;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  playsInline: boolean;
  autoPlay: boolean;
}

export default function BridgeResizableVideo({
  editor,
  nodeKey,
  src,
  poster,
  width,
  height,
  controls,
  loop,
  muted,
  playsInline,
  autoPlay,
}: BridgeResizableVideoProps) {
  return (
    <ResizableVideo
      editor={editor}
      nodeKey={nodeKey}
      src={src}
      poster={poster}
      width={width}
      height={height}
      controls={controls}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      autoPlay={autoPlay}
      onResizeEnd={(s) => {
        editor.dispatchCommand(UPDATE_VIDEO_SIZE_COMMAND, {
          key: String(nodeKey),
          width: s.width,
          height: s.height,
        });
      }}
    />
  );
}
