test("Jest gives each module a `jest`, but not on globalThis", () => {
  expect(require("./probe.cjs")).toEqual({
    bareJest: "object",
    globalThisJest: "undefined",
    nodeEnv: "test",
  });
});
