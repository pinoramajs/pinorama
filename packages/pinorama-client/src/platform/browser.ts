const setTimeout = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export { setTimeout };
