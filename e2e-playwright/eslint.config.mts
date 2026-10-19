import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser }
  },

  tseslint.configs.recommended,

  {
    files: ["**/*.{ts,mts,cts}"],
    plugins: {
      "import-x": importX,
    },
    settings: {
      "import-x/extensions": [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        }),
      ],
    },
    rules: {
      "import-x/no-unresolved": "error",
    },
  },
]);