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
      // Disallow any type - disabled (use eslint-disable comments for specific cases)
      "@typescript-eslint/no-explicit-any": "off",

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

      // Prefer nullish coalescing - disabled (style preference, || is often intentional)
      "@typescript-eslint/prefer-nullish-coalescing": "off",

      // Prefer optional chain
      "@typescript-eslint/prefer-optional-chain": "off",

      // No unnecessary conditions - disabled (defensive coding is often intentional)
      "@typescript-eslint/no-unnecessary-condition": "off",

      // Strict boolean expressions
      "@typescript-eslint/strict-boolean-expressions": "off",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Allow setState in effects for initialization patterns (localStorage, external APIs)
      "react-hooks/set-state-in-effect": "off",

      // Import rules
      "import/order": "off",
      "import/no-duplicates": "error",

      // Suppress common Next.js warnings
      "@next/next/no-img-element": "off", // Using img is sometimes intentional for external images
      "react/no-unescaped-entities": "off", // Allow quotes in JSX text
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
    "__tests__/**",
    "__tests__auth/**",
    "__tests__core/**",
    "__tests__search/**",
    "studio-digiinsta/**",
    "sanityschemasobjects/**",
    "libdownloads/**",
    "libpricing/**",
    "docs/**",
  ]),
]);

export default eslintConfig;
