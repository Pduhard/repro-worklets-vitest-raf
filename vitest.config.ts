import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // react-native-worklets 0.10 reads it at runtime; react-native-web Vite setups define process.env
  define: { "process.env.JEST_WORKER_ID": "undefined" },
  resolve: { alias: { "react-native": "react-native-web" } },
  test: {
    testTimeout: 3000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
