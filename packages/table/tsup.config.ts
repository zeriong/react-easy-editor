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
    "@lexical/table",
    "@lexical/utils",
    "@lexical/selection",
    "@react-easy-editor/core",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
