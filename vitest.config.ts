import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "react-native": "react-native-web" } },
  test: {
    testTimeout: 3000,
    projects: [
      {
        extends: true,
        // react-native-worklets 0.10 reads it at runtime; react-native-web Vite setups define process.env
        define: { "process.env.JEST_WORKER_ID": "undefined" },
        test: {
          name: "browser",
          include: ["test/**/*.test.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          include: ["test/**/*.test.ts"],
          environment: "jsdom",
          // Node cannot load the packages' extensionless ESM imports
          server: { deps: { inline: ["react-native-worklets", "react-native-web"] } },
        },
      },
    ],
  },
});
