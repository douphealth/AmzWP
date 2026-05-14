import { createServerFn } from '@tanstack/react-start';

/**
 * verifyAsin
 * Server-side reachability check for an Amazon ASIN.
 * Browsers cannot HEAD amazon.com (CORS); this runs on the edge.
 *
 * Returns:
 *  - ok: true   → ASIN format is valid AND amazon.com/dp/<asin> resolves to a product page
 *  - ok: false  → invalid format, network failure, 404, or Amazon redirected to a non-product URL
 */
export const verifyAsin = createServerFn({ method: 'POST' })
  .inputValidator((input: { asin: string }) => {
    const asin = String(input?.asin ?? '').trim().toUpperCase();
    return { asin };
  })
  .handler(async ({ data }) => {
    const { asin } = data;

    // 1. Format guard
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      return {
        ok: false as const,
        asin,
        status: 0,
        reason: 'invalid_format' as const,
        finalUrl: null,
      };
    }

    const url = `https://www.amazon.com/dp/${asin}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      // HEAD first (cheap). Fall back to GET if Amazon refuses HEAD.
      let res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AmzWP-LinkChecker/1.0; +https://amzwp.app)',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }).catch(() => null);

      if (!res || res.status === 405 || res.status === 403) {
        res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; AmzWP-LinkChecker/1.0; +https://amzwp.app)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
      }

      const finalUrl = res.url || url;
      const looksLikeProductPage =
        /\/(dp|gp\/product)\/[A-Z0-9]{10}/i.test(finalUrl) ||
        finalUrl.includes(`/${asin}`);

      // Amazon returns 404 for invalid ASINs and 503 for throttled bots.
      // Treat 503 as "unknown — don't block" so legitimate ASINs aren't dropped under bot protection.
      if (res.status === 503) {
        return {
          ok: true as const,
          asin,
          status: 503,
          reason: 'amazon_throttled_assumed_ok' as const,
          finalUrl,
        };
      }

      if (res.ok && looksLikeProductPage) {
        return { ok: true as const, asin, status: res.status, reason: 'verified' as const, finalUrl };
      }

      if (res.status === 404) {
        return { ok: false as const, asin, status: 404, reason: 'not_found' as const, finalUrl };
      }

      return {
        ok: false as const,
        asin,
        status: res.status,
        reason: looksLikeProductPage ? 'bad_status' as const : 'redirected_off_product' as const,
        finalUrl,
      };
    } catch (err: any) {
      return {
        ok: false as const,
        asin,
        status: 0,
        reason: (err?.name === 'AbortError' ? 'timeout' : 'network_error') as 'timeout' | 'network_error',
        finalUrl: null,
      };
    } finally {
      clearTimeout(timeout);
    }
  });

/**
 * verifyAsinBatch — same check, parallelized with a small concurrency cap.
 * Use this from scan / batch insertion paths.
 */
export const verifyAsinBatch = createServerFn({ method: 'POST' })
  .inputValidator((input: { asins: string[] }) => ({
    asins: Array.from(new Set((input?.asins ?? []).map((a) => String(a).trim().toUpperCase()))).slice(0, 50),
  }))
  .handler(async ({ data }) => {
    const concurrency = 5;
    const queue = [...data.asins];
    const results: Record<string, { ok: boolean; status: number; reason: string }> = {};

    async function worker() {
      while (queue.length) {
        const asin = queue.shift()!;
        try {
          const r = await verifyAsin({ data: { asin } });
          results[asin] = { ok: r.ok, status: r.status, reason: r.reason };
        } catch {
          results[asin] = { ok: false, status: 0, reason: 'invocation_error' };
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, data.asins.length) }, worker));
    return { results };
  });
