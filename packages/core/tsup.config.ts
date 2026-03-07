import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "lexical", "@lexical/react", "@lexical/html", "@lexical/rich-text", "@lexical/selection"],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
