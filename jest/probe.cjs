module.exports = {
  bareJest: typeof jest,
  globalThisJest: typeof globalThis.jest,
  nodeEnv: process.env.NODE_ENV,
};
