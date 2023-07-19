export const promiseWithTimeout = <T>(
  timeoutMilliseconds: number,
  promise: Promise<T>
) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(`Timed out after ${timeoutMilliseconds} ms`),
      timeoutMilliseconds
    )
  );
  return Promise.race([promise, timeout]);
};
