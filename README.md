# react-native-worklets swaps the browser's `requestAnimationFrame` under Vitest

Since 0.11.0, `IS_JEST` is true when `process.env.NODE_ENV === 'test'`
([`platformChecker.ts`](https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-worklets/src/platformChecker.ts), from [software-mansion/react-native-reanimated#9703](https://github.com/software-mansion/react-native-reanimated/pull/9703)).
Vitest sets `NODE_ENV=test`, also in browser mode. Worklets then runs its Jest setup in a real Chromium:
`init()` replaces `globalThis.requestAnimationFrame` with `mockedRequestAnimationFrame`, a `setTimeout(cb, 0)`.

Every frame in the page becomes a `setTimeout`, so a test that fakes `setTimeout` gets no frame at all.

## Run

```sh
pnpm install
pnpm test
```

`test/raf.test.ts`, Vitest 5 browser mode (Playwright, Chromium), no React Native, no Reanimated:

| | 0.10.4 | 0.11.0 | 0.13.0 | 0.13.0 + fix |
|---|---|---|---|---|
| `NODE_ENV` is `'test'` in the browser | ✓ | ✓ | ✓ | ✓ |
| importing worklets keeps the browser's `requestAnimationFrame` | ✓ | ✗ `mockedRequestAnimationFrame` | ✗ | ✓ |
| a frame still comes once `setTimeout` is faked | ✓ | ✗ times out | ✗ times out | ✓ |

- Other versions: `pnpm add -D react-native-worklets@0.10.4 && pnpm test`
- The fix: branch [`with-fix`](../../tree/with-fix), a one-line patch:

```diff
 export const IS_JEST: boolean =
-  typeof globalThis.jest !== 'undefined' || process.env.NODE_ENV === 'test';
+  typeof globalThis.jest !== 'undefined';
```

`define: { "process.env.JEST_WORKER_ID": "undefined" }` in `vitest.config.ts` only lets 0.10.4 load:
it reads `process.env.JEST_WORKER_ID` at runtime, and react-native-web Vite setups define `process.env` the same way.
