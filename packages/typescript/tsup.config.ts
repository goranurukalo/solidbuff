import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index.browser": "src/browser/index.ts",
    "instance.browser": "src/browser/instance.ts",
    "index.node": "src/node/index.ts",
    "instance.node": "src/node/instance.ts",
  },
  dts: true,
  format: ["esm"],
  outDir: "./dist",
  outExtension: () => ({ js: `.js` }),
});
