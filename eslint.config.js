import globals from "globals";
import ts from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    files: ["*.ts"],
    languageOptions: {
      parser: ts.parser,
      globals: globals.browser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  ...ts.configs.recommended,
  prettier,
  { ignores: ["dist", "types", "node_modules"] },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
