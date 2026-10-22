import { expect, test, vi } from "vitest";

const pageRaf = window.requestAnimationFrame;

test("process.env.NODE_ENV is 'test'", () => {
  expect(process.env.NODE_ENV).toBe("test");
});

test("importing react-native-worklets keeps the page's requestAnimationFrame", async () => {
  await import("react-native-worklets");

  expect(window.requestAnimationFrame).toBe(pageRaf);
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
