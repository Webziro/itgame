import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextVitals = require("eslint-config-next/core-web-vitals");
const nextTs = require("eslint-config-next/typescript");

let nextVitalsConfig;
if (Array.isArray(nextVitals)) {
  nextVitalsConfig = nextVitals;
} else {
  nextVitalsConfig = compat.extends("next/core-web-vitals");
}

let nextTsConfig;
if (Array.isArray(nextTs)) {
  nextTsConfig = nextTs;
} else {
  nextTsConfig = compat.extends("next/typescript");
}

const eslintConfig = [
  ...nextVitalsConfig,
  ...nextTsConfig,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
    }
  }
];

export default eslintConfig;
