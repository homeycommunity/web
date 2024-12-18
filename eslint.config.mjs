import next from "@next/eslint-plugin-next"
import tanstackQuery from "@tanstack/eslint-plugin-query"
import tsParser from "@typescript-eslint/parser"
import prettier from "eslint-config-prettier"
import tailwindcss from "eslint-plugin-tailwindcss"

export default [
  {
    ignores: [".next/*", "node_modules/*"],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      "@next/next": next,
      tailwindcss: tailwindcss,
      "@tanstack/query": tanstackQuery,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: "tailwind.config.js",
      },
      next: {
        rootDir: ["."],
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
      "tailwindcss/no-custom-classname": "off",
      ...tailwindcss.configs.recommended.rules,
      ...tanstackQuery.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  prettier,
]
