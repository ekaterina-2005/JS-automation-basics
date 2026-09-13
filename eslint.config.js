import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": "error",
    },
  },
  prettierConfig,
];