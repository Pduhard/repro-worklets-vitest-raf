# react-native-worklets swaps the browser's `requestAnimationFrame` under Vitest

Since 0.11.0, `IS_JEST` is true when `process.env.NODE_ENV === 'test'`
([`platformChecker.ts`](https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-worklets/src/platformChecker.ts), from [software-mansion/react-native-reanimated#9703](https://github.com/software-mansion/react-native-reanimated/pull/9703)).
Vitest sets `NODE_ENV=test` (`process.env.NODE_ENV ??= 'test'`), in browser mode and in jsdom alike. Worklets then runs its Jest setup outside Jest:
`init()` replaces `globalThis.requestAnimationFrame` with `mockedRequestAnimationFrame`, a `setTimeout(cb, 0)`.

Every frame in the page becomes a `setTimeout`, so a test that fakes `setTimeout` gets no frame at all.

## Run

```sh
pnpm install
pnpm test        # Vitest, browser mode (Playwright, Chromium) and jsdom
pnpm test:jest   # what Jest gives a module
```

`test/raf.test.ts`, no React Native, no Reanimated, run in both Vitest projects (`browser`, `jsdom`), same result in each:

| | 0.10.4 | 0.11.0 | 0.13.0 | 0.13.0 + fix |
|---|---|---|---|---|
| `NODE_ENV` is `'test'` | ✓ | ✓ | ✓ | ✓ |
| importing worklets keeps the page's `requestAnimationFrame` | ✓ | ✗ `mockedRequestAnimationFrame` | ✗ | ✓ |
| a frame still comes once `setTimeout` is faked | ✓ | ✗ times out | ✗ times out | ✓ |

Other versions: `pnpm add -D react-native-worklets@0.10.4 && pnpm test`.

## Fix

Branch [`with-fix`](../../tree/with-fix), a one-line patch:

```diff
-export const IS_JEST: boolean =
-  typeof globalThis.jest !== 'undefined' || process.env.NODE_ENV === 'test';
+export const IS_JEST: boolean = typeof jest !== 'undefined';
```

Why the bare `jest`: Jest hands each module a `jest` in its scope, not on `globalThis` (`pnpm test:jest`, `jest/globals.test.cjs`).
So under Jest `typeof globalThis.jest` is `'undefined'`, and only `NODE_ENV === 'test'` detects it today.
The bare `jest` is set under Jest, is not a `process.env` value a bundler could inline ([#9703](https://github.com/software-mansion/react-native-reanimated/pull/9703)'s `react-native-dotenv` case), and Vitest does not define it.
React Native's own Jest setup calls the bare `jest`, so every project on its preset has it.

The `browser` project defines `process.env.JEST_WORKER_ID` only so that 0.10.4 loads in a page with no `process`:
it reads `process.env.JEST_WORKER_ID` at runtime, and react-native-web Vite setups define `process.env` the same way.
The `jsdom` project inlines worklets because Node cannot load its extensionless ESM imports.
