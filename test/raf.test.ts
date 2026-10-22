import { expect, test, vi } from "vitest";

const browserRaf = window.requestAnimationFrame;

test("process.env.NODE_ENV is 'test' in the browser", () => {
  expect(process.env.NODE_ENV).toBe("test");
});

test("importing react-native-worklets keeps the browser's requestAnimationFrame", async () => {
  await import("react-native-worklets");

  expect(window.requestAnimationFrame).toBe(browserRaf);
});

test("a frame still comes once setTimeout is faked", async () => {
  await import("react-native-worklets");
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  try {
    await new Promise(requestAnimationFrame);
  } finally {
    vi.useRealTimers();
  }
});
