/**
 * withRetry — exponential backoff with full jitter.
 *
 * Defaults retry on transient signals: network errors, AbortError (timeout),
 * and HTTP 408/425/429/500/502/503/504. Caller can override `shouldRetry`.
 */

export interface RetryOptions {
  retries?: number;        // max retry attempts AFTER the first try (default 3)
  baseMs?: number;         // base delay (default 400ms)
  maxMs?: number;          // cap per-attempt delay (default 8000ms)
  factor?: number;         // exponential factor (default 2)
  shouldRetry?: (err: unknown, attempt: number) => boolean;
  onRetry?: (err: unknown, attempt: number, delayMs: number) => void;
  signal?: AbortSignal;    // honour external cancellation
}

const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export function isTransientError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; status?: number; code?: string; message?: string };
  if (e.name === 'AbortError') return true;
  if (typeof e.status === 'number' && TRANSIENT_STATUSES.has(e.status)) return true;
  if (e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT' || e.code === 'EAI_AGAIN') return true;
  if (typeof e.message === 'string' && /network|fetch failed|timeout/i.test(e.message)) return true;
  return false;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    baseMs = 400,
    maxMs = 8000,
    factor = 2,
    shouldRetry = isTransientError,
    onRetry,
    signal,
  } = opts;

  let attempt = 0;
  // attempt 0 is the first try; attempts 1..retries are retries
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !shouldRetry(err, attempt)) throw err;
      const expDelay = Math.min(maxMs, baseMs * Math.pow(factor, attempt));
      const delay = Math.floor(Math.random() * expDelay); // full jitter
      onRetry?.(err, attempt + 1, delay);
      await sleep(delay, signal);
      attempt += 1;
    }
  }
}

/**
 * fetchWithRetry — convenience: throws an Error with .status set on
 * non-2xx responses so withRetry's default predicate triggers.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: RetryOptions,
): Promise<Response> {
  return withRetry(async () => {
    const res = await fetch(input, init);
    if (!res.ok && TRANSIENT_STATUSES.has(res.status)) {
      const err: Error & { status?: number } = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res;
  }, opts);
}
