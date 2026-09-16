import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Prevent client from importing server
  {
    files: ["src/client/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/server/*", "**/server/**", "@/server/*", "@/server/**"],
              message:
                "❌ Client cannot import from Server directly. Use API endpoints or shared types.",
            },
          ],
        },
      ],
    },
  },
  // Prevent server from importing client
  {
    files: ["src/server/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/client/*", "**/client/**", "@/client/*", "@/client/**"],
              message:
                "❌ Server cannot import from Client. Keep business logic independent of UI.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
