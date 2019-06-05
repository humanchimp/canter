import ts from "@wessberg/rollup-plugin-ts";
import typescript from "typescript";
import packageJson from "./package.json";

export default {
  input: "src/plugin.ts",
  output: [
    {
      format: "cjs",
      file: packageJson.main,
      sourcemap: true,
    },
    {
      format: "esm",
      file: packageJson.module,
      sourcemap: true,
    },
  ],
  plugins: [ts({ typescript })]
};
