import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "lexical",
    "@lexical/react",
    "@react-easy-editor/core",
    "@react-easy-editor/toolbar",
    "@react-easy-editor/history",
    "@react-easy-editor/text-style",
    "@react-easy-editor/text-color",
    "@react-easy-editor/alignment",
    "@react-easy-editor/block-type",
    "@react-easy-editor/image",
    "@react-easy-editor/video",
    "@react-easy-editor/table",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
