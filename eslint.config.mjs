// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([...nextVitals, ...nextTs, {
  plugins: { import: importPlugin },
  rules: {
    "import/order": [
      "warn",
      {
        groups: [
          ["builtin", "external"],
          "internal",
          ["parent", "sibling", "index"],
          "type",
        ],
        pathGroups: [
          { pattern: "react", group: "external", position: "before" },
          { pattern: "next/**", group: "external", position: "before" },
          { pattern: "@/**", group: "internal" },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
      },
    ],
  },
}, prettierConfig, // Override default ignores of eslint-config-next.
globalIgnores([
  // Default ignores of eslint-config-next:
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
]), ...storybook.configs["flat/recommended"]]);

export default eslintConfig;
