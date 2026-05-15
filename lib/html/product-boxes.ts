/**
 * Product-box HTML generation — class-based templates with a single
 * hoisted <style> block per post.
 *
 * Why this exists:
 *   The previous generators inlined ~300 lines of CSS into EVERY product
 *   box. A 10-product post shipped ~3,000 lines of duplicated style
 *   attributes (hundreds of KB). This module emits compact class-based
 *   markup and a single shared <style> block via `getProductBoxStyles()`,
 *   shrinking 10-box posts from MBs to ~30 KB.
 *
 * Public API:
 *   - generateProductBoxHtml(product, tag, mode)
 *   - generateComparisonTableHtml(data, products, tag)
 *   - getProductBoxStyles()  -> one <style> block; insert once per post
 *   - wrapWithProductBoxStyles(html)  -> convenience: prefixes the style
 *
 * Backwards compatible: `utils.ts` re-exports these symbols.
 */

import type {
  ComparisonData,
  DeploymentMode,
  FAQItem,
  ProductDetails,
} from '../../types';

// ---------------------------------------------------------------------------
// Hoisted CSS  (emit ONCE per post via getProductBoxStyles)
// ---------------------------------------------------------------------------

const STYLE_MARKER = 'data-amzwp-styles';

const STYLES = `
.amzwp-tl,.amzwp-eb,.amzwp-ct{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-sizing:border-box}
.amzwp-tl *,.amzwp-eb *,.amzwp-ct *{box-sizing:border-box}
.amzwp-tl{max-width:920px;margin:2rem auto;padding:1.25rem;background:linear-gradient(135deg,#fff,#f8fafc 45%,#eef6ff);border:1px solid #dbeafe;border-radius:1.5rem;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;box-shadow:0 20px 48px rgba(15,23,42,.08);position:relative;overflow:hidden}
.amzwp-tl-img{width:100px;height:100px;object-fit:contain;background:#fff;border-radius:1rem;padding:.5rem;border:1px solid #e2e8f0;box-shadow:0 12px 28px rgba(15,23,42,.08)}
.amzwp-tl-prime{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:3px 9px;border-radius:999px;font-size:9px;font-weight:700}
.amzwp-tl-body{flex:1;min-width:200px}
.amzwp-tl-tag{font-size:10px;color:#2563eb;font-weight:800;text-transform:uppercase;letter-spacing:.14em}
.amzwp-tl-brand{font-size:10px;color:#64748b;font-weight:700;margin-left:8px}
.amzwp-tl-title{margin:0;font-size:1.05rem;font-weight:800;color:#0f172a;line-height:1.35}
.amzwp-tl-meta{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;font-size:11px}
.amzwp-stars{color:#f59e0b;font-size:14px}
.amzwp-tl-price{text-align:center}
.amzwp-tl-price-label,.amzwp-eb-price-label{font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
.amzwp-tl-price-val{font-size:1.75rem;font-weight:900;color:#0f172a;line-height:1}
.amzwp-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff!important;text-decoration:none;border-radius:12px;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.08em;box-shadow:0 12px 24px rgba(37,99,235,.25);margin-top:12px}
.amzwp-cta-lg{padding:16px 28px;border-radius:14px;font-size:13px;letter-spacing:.1em;box-shadow:0 14px 30px rgba(37,99,235,.28)}
.amzwp-eb{max-width:1000px;margin:3rem auto;background:#fff;border-radius:2rem;box-shadow:0 28px 80px rgba(15,23,42,.12);overflow:hidden;border:1px solid #dbeafe}
.amzwp-eb-head{background:linear-gradient(135deg,#eff6ff,#fff 55%,#eef2ff);padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #dbeafe;gap:1rem;flex-wrap:wrap}
.amzwp-eb-pill{background:#0f172a;color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.15em;padding:8px 12px;border-radius:999px}
.amzwp-eb-sub{color:#1d4ed8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;margin-left:10px}
.amzwp-eb-date{color:#475569;font-size:10px;font-weight:700}
.amzwp-eb-main{display:flex;flex-wrap:wrap}
.amzwp-eb-imgcol{flex:.95;min-width:280px;padding:2.25rem;background:radial-gradient(circle at top,#fff 0%,#eff6ff 100%);display:flex;align-items:center;justify-content:center;position:relative;border-right:1px solid #e2e8f0}
.amzwp-eb-rating{position:absolute;top:1rem;left:1rem;background:#fff;padding:9px 14px;border-radius:999px;box-shadow:0 10px 24px rgba(15,23,42,.08);display:flex;align-items:center;gap:8px;border:1px solid #e2e8f0;font-size:11px;color:#334155;font-weight:700}
.amzwp-eb-img{max-width:280px;max-height:280px;object-fit:contain;filter:drop-shadow(0 24px 48px rgba(15,23,42,.18));mix-blend-mode:multiply}
.amzwp-eb-prime{position:absolute;bottom:1rem;left:1rem;background:#0f172a;color:#fff;padding:7px 12px;border-radius:999px;font-size:10px;font-weight:700}
.amzwp-eb-body{flex:1.25;min-width:320px;padding:2.25rem}
.amzwp-eb-cat{display:inline-block;background:linear-gradient(135deg,#eff6ff,#dbeafe);color:#2563eb;padding:6px 14px;border-radius:999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
.amzwp-eb-brand{color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-left:10px}
.amzwp-eb-title{margin:1rem 0 .9rem;font-size:1.85rem;font-weight:900;color:#0f172a;line-height:1.15;letter-spacing:-.02em}
.amzwp-eb-verdict{background:linear-gradient(135deg,#f8fafc,#eff6ff);border:1px solid #dbeafe;padding:1rem 1.15rem;border-radius:1rem;margin-bottom:1.5rem;color:#334155;font-size:14px;line-height:1.65;font-weight:500}
.amzwp-eb-bullets{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:1.5rem}
.amzwp-eb-bullet{display:flex;align-items:flex-start;gap:8px;padding:12px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 6px 16px rgba(15,23,42,.04);color:#1e293b;font-size:12px;font-weight:600;line-height:1.5}
.amzwp-eb-bullet b{color:#2563eb;font-weight:bold;font-size:12px}
.amzwp-eb-foot{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-top:1.5rem;border-top:1px solid #e2e8f0}
.amzwp-eb-price-val{font-size:2.5rem;font-weight:900;color:#0f172a;line-height:1}
.amzwp-eb-faqs{background:#f8fafc;padding:1.5rem 2rem;border-top:1px solid #e2e8f0}
.amzwp-eb-faqs-title{font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem}
.amzwp-eb-faq{padding:14px 0;border-bottom:1px solid #e2e8f0}
.amzwp-eb-faq:last-child{border-bottom:none}
.amzwp-eb-faq-q{font-weight:800;color:#0f172a;font-size:13px;margin-bottom:6px}
.amzwp-eb-faq-a{color:#475569;font-size:12px;line-height:1.6}
.amzwp-eb-trust{background:#fff;padding:1rem 2rem;display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;border-top:1px solid #e2e8f0;color:#475569;font-size:11px;font-weight:700}
.amzwp-ct{max-width:1100px;margin:3rem auto;background:#fff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);overflow:hidden;border:1px solid #e2e8f0}
.amzwp-ct-head{background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px 28px;display:flex;align-items:center;justify-content:space-between}
.amzwp-ct-head h3{margin:0;color:#fff;font-size:1.1rem;font-weight:800;letter-spacing:-.01em}
.amzwp-ct-head p{margin:4px 0 0;color:#64748b;font-size:12px}
.amzwp-ct-live{display:flex;align-items:center;gap:6px;color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em}
.amzwp-ct-live::before{content:"";width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block}
.amzwp-ct table{width:100%;border-collapse:collapse;min-width:600px}
.amzwp-ct td{padding:14px 16px;text-align:center;border-right:1px solid #f1f5f9;vertical-align:top}
.amzwp-ct-cell-head{padding:28px 20px!important;position:relative}
.amzwp-ct-top{background:#f0f9ff!important}
.amzwp-ct-top-badge{position:absolute;top:0;left:50%;transform:translateX(-50%);background:#2563eb;color:#fff;padding:5px 16px;border-radius:0 0 10px 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;box-shadow:0 4px 12px rgba(37,99,235,.3)}
.amzwp-ct-img{height:140px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.amzwp-ct-img img{max-width:130px;max-height:130px;object-fit:contain}
.amzwp-ct-title{margin:0 0 10px;font-size:14px;font-weight:700;color:#0f172a;line-height:1.4;min-height:40px}
.amzwp-ct-price{font-size:28px;font-weight:900;color:#0f172a;margin-bottom:16px;letter-spacing:-.02em}
.amzwp-ct-cta{display:inline-block;width:90%;padding:12px 20px;background:#0f172a;color:#fff!important;text-decoration:none;border-radius:10px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.05em;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.amzwp-ct-cta-top{background:#2563eb;box-shadow:0 4px 12px rgba(37,99,235,.3)}
.amzwp-ct-row-alt{background:#f8fafc}
.amzwp-ct-spec-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.amzwp-ct-spec-val{font-size:13px;font-weight:600;color:#1e293b}
.amzwp-ct-foot{background:#f8fafc;padding:10px 28px;border-top:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:10px}
@media (max-width:640px){.amzwp-eb-bullets{grid-template-columns:1fr}.amzwp-eb-title{font-size:1.4rem}.amzwp-eb-price-val{font-size:2rem}}
`.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();

/** Single <style> block. Insert ONCE per post; safe to dedupe by the marker. */
export const getProductBoxStyles = (): string =>
  `<style ${STYLE_MARKER}>${STYLES}</style>`;

/** Prefix a chunk of HTML with the shared style block iff not already present. */
export const wrapWithProductBoxStyles = (html: string): string =>
  html.includes(STYLE_MARKER) ? html : `${getProductBoxStyles()}\n${html}`;

// ---------------------------------------------------------------------------
// Helpers (no inline runtime cost)
// ---------------------------------------------------------------------------

const escAttr = (s: string) =>
  String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const truncate = (s: string, n: number) =>
  s.length <= n ? s : `${s.slice(0, n - 3)}...`;

const stars = (rating?: number): number =>
  Math.min(5, Math.max(0, Math.round(rating ?? 4.5)));

// These were previously imported transitively from utils.ts.  Kept inline
// to avoid creating an import cycle while utils.ts re-exports from here.
const generateSmartClaims = (p: ProductDetails): string[] => [
  `${p.rating?.toFixed(1) || '4.5'}-star rated by ${(p.reviewCount || 0).toLocaleString()} verified buyers`,
  p.prime ? 'Eligible for fast Prime shipping' : 'Available with standard shipping',
  p.brand ? `Trusted ${p.brand} build quality` : 'Vetted by editorial team',
  'Backed by Amazon return policy',
];

const generateSmartVerdict = (p: ProductDetails): string =>
  `${p.title} stands out in the ${p.category || 'category'} thanks to consistent ${p.rating?.toFixed(1) || '4.5'}-star feedback across ${(p.reviewCount || 0).toLocaleString()} reviews.`;

const generateProductFaqs = (p: ProductDetails): { q: string; a: string }[] => {
  if (p.faqs?.length) return p.faqs.slice(0, 4).map(f => ({ q: f.question, a: f.answer }));
  return [
    { q: `Is the ${p.title} worth it?`, a: `With a ${p.rating?.toFixed(1) || '4.5'}-star rating from ${(p.reviewCount || 0).toLocaleString()} buyers, it consistently delivers on value.` },
    { q: 'Does it ship with Prime?', a: p.prime ? 'Yes — Prime members get fast, free delivery.' : 'Prime eligibility varies by seller. Check the current Amazon listing.' },
    { q: 'How long is the return window?', a: 'Amazon\'s standard 30-day return policy applies to most orders.' },
  ];
};

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const tacticalLink = (p: ProductDetails, url: string, s: number): string => {
  const priceNote = p.prime ? 'Prime delivery eligible' : 'Current Amazon offer';
  const title = escAttr(p.title);
  return `<div class="amzwp-tl">
<div style="position:relative">
<img class="amzwp-tl-img" src="${escAttr(p.imageUrl)}" alt="${title}">
${p.prime ? '<div class="amzwp-tl-prime">&#10003; Prime</div>' : ''}
</div>
<div class="amzwp-tl-body">
<span class="amzwp-tl-tag">Editor's pick</span><span class="amzwp-tl-brand">${escAttr(p.brand || 'Amazon Favorite')}</span>
<h4 class="amzwp-tl-title">${title}</h4>
<div class="amzwp-tl-meta">
<span class="amzwp-stars">${'&#9733;'.repeat(s)}${'&#9734;'.repeat(5 - s)}</span>
<span style="color:#475569;font-weight:700">${(p.reviewCount || 0).toLocaleString()} reviews</span>
<span style="color:#94a3b8">&bull;</span>
<span style="color:#0f766e;font-weight:700">${priceNote}</span>
</div>
</div>
<div class="amzwp-tl-price">
<div class="amzwp-tl-price-label">Current price</div>
<div class="amzwp-tl-price-val">${escAttr(p.price)}</div>
<a class="amzwp-cta" href="${escAttr(url)}" target="_blank" rel="nofollow sponsored noopener">Check Price &rarr;</a>
</div>
</div>`;
};

const eliteBento = (p: ProductDetails, url: string, s: number, date: string): string => {
  const bullets = p.evidenceClaims?.length ? p.evidenceClaims.slice(0, 4) : generateSmartClaims(p);
  const verdict = p.verdict || generateSmartVerdict(p);
  const faqs = generateProductFaqs(p);
  const title = escAttr(p.title);
  const reviewLabel = `${(p.reviewCount || 0).toLocaleString()} verified reviews`;

  const faqHtml = faqs.map(f =>
    `<div class="amzwp-eb-faq"><div class="amzwp-eb-faq-q">${escAttr(f.q)}</div><div class="amzwp-eb-faq-a">${escAttr(f.a)}</div></div>`
  ).join('');

  const bulletHtml = bullets.map(c =>
    `<div class="amzwp-eb-bullet"><b>+</b><span>${escAttr(c)}</span></div>`
  ).join('');

  return `<section class="amzwp-eb" aria-label="Recommended product">
<div class="amzwp-eb-head">
<div><span class="amzwp-eb-pill">Editor's Choice</span><span class="amzwp-eb-sub">High-conviction pick</span></div>
<span class="amzwp-eb-date">Verified ${date}</span>
</div>
<div class="amzwp-eb-main">
<div class="amzwp-eb-imgcol">
<div class="amzwp-eb-rating"><span class="amzwp-stars">${'&#9733;'.repeat(s)}</span><span>${reviewLabel}</span></div>
<img class="amzwp-eb-img" src="${escAttr(p.imageUrl)}" alt="${title}">
${p.prime ? '<div class="amzwp-eb-prime">Prime delivery</div>' : ''}
</div>
<div class="amzwp-eb-body">
<span class="amzwp-eb-cat">${escAttr(p.category || 'Featured')}</span><span class="amzwp-eb-brand">${escAttr(p.brand || 'Amazon bestseller')}</span>
<h3 class="amzwp-eb-title">${title}</h3>
<div class="amzwp-eb-verdict">${escAttr(verdict)}</div>
<div class="amzwp-eb-bullets">${bulletHtml}</div>
<div class="amzwp-eb-foot">
<div>
<div class="amzwp-eb-price-label">Current Amazon price</div>
<div class="amzwp-eb-price-val">${escAttr(p.price)}</div>
<div style="margin-top:6px;color:#0f766e;font-size:11px;font-weight:700">${p.prime ? 'Fast Prime shipping available' : 'Availability may vary by seller'}</div>
</div>
<a class="amzwp-cta amzwp-cta-lg" href="${escAttr(url)}" target="_blank" rel="nofollow sponsored noopener" aria-label="Check price for ${title} on Amazon">Check Price <span>&rarr;</span></a>
</div>
</div>
</div>
<div class="amzwp-eb-faqs"><div class="amzwp-eb-faqs-title">Frequently Asked Questions</div>${faqHtml}</div>
<div class="amzwp-eb-trust"><span>Secure Checkout</span><span>Fast Shipping</span><span>Easy Returns</span><span>Amazon Verified</span></div>
</section>`;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const generateProductBoxHtml = (
  product: ProductDetails,
  affiliateTag: string,
  mode: DeploymentMode = 'ELITE_BENTO',
): string => {
  const tag = affiliateTag || 'amzwp-20';
  const url = `https://www.amazon.com/dp/${product.asin}?tag=${encodeURIComponent(tag)}`;
  const s = stars(product.rating);
  const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return mode === 'TACTICAL_LINK' ? tacticalLink(product, url, s) : eliteBento(product, url, s, date);
};

export const generateComparisonTableHtml = (
  data: ComparisonData,
  products: ProductDetails[],
  affiliateTag: string,
): string => {
  const tag = affiliateTag || 'amzwp-20';
  const tableProducts = data.productIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as ProductDetails[];
  if (tableProducts.length < 2) return '';

  const colWidth = Math.floor(100 / tableProducts.length);
  const customSpecs = (data.specs || []).filter(
    s => !['rating', 'reviews', 'prime', 'price'].includes(s.toLowerCase()),
  );

  const specRows = customSpecs.map((spec, idx) => `
<tr${idx % 2 === 0 ? ' class="amzwp-ct-row-alt"' : ''}>
${tableProducts.map(p => `<td style="width:${colWidth}%"><div class="amzwp-ct-spec-label">${escAttr(spec)}</div><div class="amzwp-ct-spec-val">${escAttr(p.specs?.[spec] || '-')}</div></td>`).join('')}
</tr>`).join('');

  const shippingRow = tableProducts.some(p => p.prime) ? `
<tr class="amzwp-ct-row-alt">
${tableProducts.map(p => `<td style="width:${colWidth}%"><div class="amzwp-ct-spec-label">Shipping</div><div class="amzwp-ct-spec-val" style="color:${p.prime ? '#059669' : '#94a3b8'}">${p.prime ? '&#9889; Prime' : 'Standard'}</div></td>`).join('')}
</tr>` : '';

  return `<div class="amzwp-ct">
<div class="amzwp-ct-head">
<div><h3>${escAttr(data.title)}</h3><p>${tableProducts.length} products compared</p></div>
<div class="amzwp-ct-live">Live Prices</div>
</div>
<div style="overflow-x:auto"><table><tbody>
<tr>
${tableProducts.map((p, idx) => `<td class="amzwp-ct-cell-head${idx === 0 ? ' amzwp-ct-top' : ''}" style="width:${colWidth}%">
${idx === 0 ? '<div class="amzwp-ct-top-badge">&#9733; Top Pick</div>' : ''}
<div class="amzwp-ct-img"><img src="${escAttr(p.imageUrl)}" alt="${escAttr(p.title)}"></div>
<h4 class="amzwp-ct-title">${escAttr(truncate(p.title, 55))}</h4>
<div class="amzwp-stars" style="margin-bottom:4px">${'&#9733;'.repeat(stars(p.rating))}</div>
<div style="font-size:11px;color:#94a3b8;margin-bottom:12px">${p.rating?.toFixed(1) || '4.5'}/5 &middot; ${(p.reviewCount || 0).toLocaleString()} ratings</div>
<div class="amzwp-ct-price">${escAttr(p.price)}</div>
<a class="amzwp-ct-cta${idx === 0 ? ' amzwp-ct-cta-top' : ''}" href="https://www.amazon.com/dp/${escAttr(p.asin)}?tag=${encodeURIComponent(tag)}" target="_blank" rel="nofollow sponsored noopener">Check Price &#8599;</a>
</td>`).join('')}
</tr>
${specRows}${shippingRow}
</tbody></table></div>
<div class="amzwp-ct-foot">Prices and availability are accurate as of the date/time indicated and are subject to change.</div>
</div>`;
};

export const generateFaqSchema = (faqs: FAQItem[]): string => {
  if (!faqs?.length) return '';
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  })}</script>`;
};
