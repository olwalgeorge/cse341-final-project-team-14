import globals from "globals";
import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.jest } } },
  pluginJs.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.test.js", "**/tests/**", "**/coverage/**"],
    rules: {
      "no-undef": "off"
    }
  }
];
