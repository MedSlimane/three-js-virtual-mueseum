import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactThreePlugin from "@react-three/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      js,
      reactThree: reactThreePlugin,
    },
    extends: [
      "js/recommended",
      // enable recommended react-three rules
      "plugin:@react-three/recommended",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);