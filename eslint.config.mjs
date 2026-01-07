import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // TypeScript strict rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Disallow any type (warn instead of error for flexibility)
      "@typescript-eslint/no-explicit-any": "warn",

      // Require explicit return types on functions
      "@typescript-eslint/explicit-function-return-type": "off",

      // Disallow unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Require consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // No floating promises
      "@typescript-eslint/no-floating-promises": "error",

      // No misused promises
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

      // Prefer nullish coalescing
      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      // Prefer optional chain
      "@typescript-eslint/prefer-optional-chain": "warn",

      // No unnecessary conditions
      "@typescript-eslint/no-unnecessary-condition": "warn",

      // Strict boolean expressions
      "@typescript-eslint/strict-boolean-expressions": "off",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Import rules
      "import/order": "off",
      "import/no-duplicates": "error",
    },
  },

  // Override default ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "payload-types.ts",
    "*.config.js",
    "*.config.mjs",
    "*.config.ts",
    "sentry.*.config.ts",
    "instrumentation*.ts",
    "migrations/**",
  ]),
]);

export default eslintConfig;
