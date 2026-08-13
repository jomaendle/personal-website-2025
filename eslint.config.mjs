import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".netlify/**",
      "out/**",
      "node_modules/**",
      "public/**",
    ],
  },
  ...nextConfig,
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
