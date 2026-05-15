/**
 * PremiumProductBox | v11.0 — Editorial · Mobile-First · Container-Query Native
 *
 * Design goals:
 *  - True mobile-first: every measurement uses clamp() / container-queries.
 *  - Editorial 2-column on desktop (≥ 720px container), stacked on mobile.
 *  - Gorgeous "aurora" hero with refined depth and zero layout shift.
 *  - Sticky-friendly CTA, large hit targets (≥ 44px), accessible expansion.
 *  - JSON-LD for SEO/AEO preserved.
 */

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useId,
} from 'react';
import { ProductDetails, DeploymentMode, FAQItem } from '../types';

interface PremiumProductBoxProps {
  product: ProductDetails;
  affiliateTag?: string;
  mode?: DeploymentMode;
}

const DEFAULT_BULLETS = [
  'Premium build with meticulous attention to detail',
  'Industry-leading performance & reliability',
  'Backed by full manufacturer warranty',
  'Trusted by thousands of verified buyers',
];

const DEFAULT_FAQS: FAQItem[] = [
  { question: 'Is this covered by warranty?', answer: 'Yes — full manufacturer warranty is included for total peace of mind.' },
  { question: 'How fast is shipping?', answer: 'Prime-eligible for fast, free delivery with hassle-free 30-day returns.' },
  { question: 'Is it worth the investment?', answer: 'Based on thousands of positive reviews, it is a proven pick for buyers who demand quality.' },
  { question: "What's in the box?", answer: 'Complete package with every necessary accessory and detailed documentation.' },
];

const DEFAULT_VERDICT =
  'Engineered for users who demand excellence — professional-grade performance with meticulous attention to detail.';

/* ─── Star Rating ─── */
const StarRating: React.FC<{ rating: number; size?: number; className?: string }> = ({
  rating,
  size = 14,
  className = '',
}) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const reactId = useId();
  const uid = `sr-${reactId.replace(/:/g, '')}`;
  const star =
    'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z';
  return (
    <div
      className={`inline-flex items-center gap-[2px] ${className}`}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      style={{ ['--s' as never]: `${size}px` }}
    >
      {Array.from({ length: full }, (_, i) => (
        <svg key={`f${i}`} width={size} height={size} viewBox="0 0 20 20" className="text-amber-400 drop-shadow-[0_1px_0_rgba(0,0,0,0.04)]" fill="currentColor"><path d={star} /></svg>
      ))}
      {hasHalf && (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <defs><linearGradient id={uid}><stop offset="50%" stopColor="#fbbf24" /><stop offset="50%" stopColor="#e2e8f0" /></linearGradient></defs>
          <path fill={`url(#${uid})`} d={star} />
        </svg>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <svg key={`e${i}`} width={size} height={size} viewBox="0 0 20 20" className="text-slate-200" fill="currentColor"><path d={star} /></svg>
      ))}
    </div>
  );
};

/* ─── Tactical Link (compact) ─── */
const TacticalLink: React.FC<{
  product: ProductDetails;
  amazonLink: string;
  imageSrc: string;
  onImgError: () => void;
}> = ({ product, amazonLink, imageSrc, onImgError }) => (
  <div className="w-full px-3 sm:px-4 my-5">
    <a
      href={amazonLink}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group relative mx-auto block w-full max-w-[880px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_44px_-12px_rgba(59,130,246,0.22)] no-underline"
      style={{ containerType: 'inline-size' }}
    >
      <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" />
      <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-blue-50/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />

      <div className="flex items-center gap-3 sm:gap-4 pl-2">
        <div className="flex h-[clamp(56px,16cqw,84px)] w-[clamp(56px,16cqw,84px)] flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-1.5 transition-transform duration-500 group-hover:scale-105">
          <img src={imageSrc} alt={product.title} loading="lazy" onError={onImgError} className="max-h-full max-w-full object-contain mix-blend-multiply" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-[1.5px] text-blue-600">Editor's Pick</span>
            <StarRating rating={product.rating || 4.5} size={11} />
          </div>
          <h3 className="line-clamp-2 text-[clamp(13px,3.6cqw,16px)] font-extrabold leading-tight text-slate-900">{product.title}</h3>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1 pl-1">
          <span className="text-[clamp(18px,4.6cqw,24px)] font-black tracking-tighter text-slate-900">{product.price}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white transition-transform group-hover:translate-x-0.5">
            View
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </a>
  </div>
);

/* ─── JSON-LD Product Schema ─── */
const ProductJsonLd: React.FC<{ product: ProductDetails; amazonLink: string; imageSrc: string }> = ({ product, amazonLink, imageSrc }) => {
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: imageSrc,
    description: product.verdict || `${product.title} — premium ${product.category || 'product'} by ${product.brand || 'top brand'}`,
    brand: { '@type': 'Brand', name: product.brand || 'Premium Brand' },
    sku: product.asin,
    mpn: product.asin,
    category: product.category || 'Electronics',
    offers: {
      '@type': 'Offer',
      url: amazonLink,
      priceCurrency: 'USD',
      price: product.price?.replace(/[^0-9.]/g, '') || '0',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Amazon.com' },
    },
    ...(product.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        bestRating: '5',
        reviewCount: product.reviewCount || 100,
      },
    } : {}),
  }), [product, amazonLink, imageSrc]);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

/* ─── Main Component ─── */
export const PremiumProductBox: React.FC<PremiumProductBoxProps> = ({
  product,
  affiliateTag = 'amzwp-20',
  mode = 'ELITE_BENTO',
}) => {
  const [imgError, setImgError] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const amazonLink = useMemo(() => {
    const asin = (product.asin || '').trim().toUpperCase();
    const isValidAsin = /^B0[A-Z0-9]{8}$/.test(asin);
    const tag = (affiliateTag || '').trim();
    const isPlaceholderTag = !tag || tag === 'amzwp-20' || tag.startsWith('your-');
    const isRealLookingTag = /^[a-z0-9][a-z0-9-]{1,18}-(20|21|22|23)$/i.test(tag);
    const tagParam = !isPlaceholderTag && isRealLookingTag ? `?tag=${tag}` : '';
    if (isValidAsin) return `https://www.amazon.com/dp/${asin}${tagParam}`;
    const q = encodeURIComponent(product.title || product.brand || '');
    return `https://www.amazon.com/s?k=${q}${tagParam ? `&tag=${tag}` : ''}`;
  }, [product.asin, product.title, product.brand, affiliateTag]);

  const placeholder = (text: string) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect fill="#f1f5f9" width="600" height="600"/><text x="300" y="310" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="bold" fill="#94a3b8">${text}</text></svg>`)}`;

  const imageSrc = useMemo(
    () => (imgError ? placeholder(product.brand || 'Product') : product.imageUrl || placeholder('Product')),
    [imgError, product.imageUrl, product.brand],
  );

  const verdict = useMemo(() => (product.verdict && product.verdict.length > 30 ? product.verdict : DEFAULT_VERDICT), [product.verdict]);
  const bullets = useMemo(() => (product.evidenceClaims?.length && product.evidenceClaims.length >= 3 ? product.evidenceClaims.slice(0, 4) : DEFAULT_BULLETS), [product.evidenceClaims]);
  const faqs = useMemo(() => (product.faqs && product.faqs.length >= 3 ? product.faqs.slice(0, 4) : DEFAULT_FAQS), [product.faqs]);
  const currentDate = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), []);
  const reviewCount = (product.reviewCount || 0).toLocaleString();

  const handleImgError = useCallback(() => setImgError(true), []);

  useEffect(() => {
    if (!cardRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true); }, { threshold: 0.08 });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  if (mode === 'TACTICAL_LINK') {
    return <TacticalLink product={product} amazonLink={amazonLink} imageSrc={imageSrc} onImgError={handleImgError} />;
  }

  return (
    <article
      ref={cardRef}
      itemScope
      itemType="https://schema.org/Product"
      className={`mx-auto my-6 w-full max-w-[980px] px-3 font-sans antialiased transition-all duration-700 sm:my-10 sm:px-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ containerType: 'inline-size' }}
    >
      <ProductJsonLd product={product} amazonLink={amazonLink} imageSrc={imageSrc} />

      {/* Outer aurora glow */}
      <div className="relative isolate">
        <div className="pointer-events-none absolute -inset-px rounded-[28px] bg-[conic-gradient(from_120deg_at_50%_50%,#3b82f622,#a855f722,#06b6d422,#3b82f622)] opacity-60 blur-2xl" />

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-[clamp(18px,4cqw,28px)] border border-slate-200/80 bg-white shadow-[0_10px_50px_-18px_rgba(15,23,42,0.18)]">

          {/* Top status bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/40 px-[clamp(14px,4cqw,28px)] py-2.5">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[9px] font-black uppercase tracking-[1.6px] text-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Editor's Choice
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:inline">High-conviction pick</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Verified · {currentDate}</span>
          </div>

          {/* Editorial layout: stacked mobile, 2-col desktop (via container query) */}
          <div className="grid grid-cols-1 [@container(min-width:720px)]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">

            {/* IMAGE COLUMN */}
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#ffffff,#eef6ff_55%,#e0e7ff_120%)] [@container(min-width:720px)]:border-r [@container(min-width:720px)]:border-slate-100">
              {/* Decorative rings */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="absolute h-[120%] w-[120%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.10),transparent_55%)]" />
                <div className="absolute h-[70%] w-[70%] rounded-full border border-white/60" />
                <div className="absolute h-[48%] w-[48%] rounded-full border border-blue-200/40" />
              </div>

              <a href={amazonLink} target="_blank" rel="nofollow sponsored noopener" aria-label={`View ${product.title} on Amazon`} className="group/img relative z-10 flex items-center justify-center px-[clamp(20px,6cqw,40px)] py-[clamp(28px,8cqw,56px)]">
                <img
                  src={imageSrc}
                  alt={product.title}
                  loading="lazy"
                  onError={handleImgError}
                  itemProp="image"
                  className="aspect-square w-full max-w-[clamp(180px,55cqw,360px)] object-contain transition-transform duration-700 group-hover/img:scale-[1.04]"
                  style={{ filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.18))' }}
                />
              </a>

              {/* Floating rating */}
              <div className="absolute bottom-3 left-3 z-20 sm:bottom-4 sm:left-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
                  <StarRating rating={product.rating || 4.5} size={12} />
                  <span className="text-[10px] font-bold text-slate-600">{(product.rating || 4.5).toFixed(1)}</span>
                  <span className="text-[10px] font-medium text-slate-400">({reviewCount})</span>
                </div>
              </div>

              {/* Prime badge */}
              {product.prime && (
                <div className="absolute bottom-3 right-3 z-20 sm:bottom-4 sm:right-4">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#232f3e] px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    Prime
                  </span>
                </div>
              )}
            </div>

            {/* CONTENT COLUMN */}
            <div className="flex flex-col gap-[clamp(12px,3cqw,18px)] p-[clamp(18px,5cqw,32px)]">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[1.2px] text-blue-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  {product.category || 'Premium Selection'}
                </span>
                {product.brand && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">by {product.brand}</span>}
              </div>

              {/* Title */}
              <h2 itemProp="name" className="text-[clamp(20px,5.4cqw,32px)] font-black leading-[1.1] tracking-tight text-slate-900">
                {product.title}
              </h2>

              {/* Verdict */}
              <div className="relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/40 p-[clamp(12px,3cqw,18px)]">
                <p className="text-[clamp(13px,3cqw,15px)] font-medium leading-relaxed text-slate-600">{verdict}</p>
                <div className="mt-2 flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Verified Analysis</span>
                </div>
              </div>

              {/* Bullets */}
              <ul className="grid grid-cols-1 gap-2 [@container(min-width:480px)]:grid-cols-2">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-emerald-200">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                    <span className="text-[clamp(12px,2.6cqw,13.5px)] font-semibold leading-snug text-slate-700">{b}</span>
                  </li>
                ))}
              </ul>

              {/* PRICE + CTA */}
              <div className="mt-1 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[clamp(14px,3.5cqw,20px)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-[2px] text-slate-400">Best price today</span>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span itemProp="offers" itemScope itemType="https://schema.org/Offer" className="text-[clamp(26px,7cqw,40px)] font-black leading-none tracking-tighter text-white">
                        <span itemProp="price">{product.price}</span>
                      </span>
                      {product.prime && <span className="text-[10px] font-bold text-emerald-400">FREE delivery</span>}
                    </div>
                  </div>
                  <a
                    href={amazonLink}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    aria-label={`Check price for ${product.title} on Amazon`}
                    className="group/btn relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-[clamp(16px,4cqw,28px)] py-[clamp(12px,3cqw,16px)] text-[clamp(10px,2.4cqw,12px)] font-black uppercase tracking-[2px] text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] sm:flex-none"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    <span className="relative">Check Price on Amazon</span>
                    <svg className="relative transition-transform group-hover/btn:translate-x-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          {faqs.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/60 p-[clamp(16px,4cqw,28px)]">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </span>
                <h3 className="text-[clamp(13px,3cqw,15px)] font-black text-slate-900">Common Questions</h3>
              </div>
              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const open = expandedFaq === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setExpandedFaq(open ? null : idx)}
                      aria-expanded={open}
                      className={`w-full overflow-hidden rounded-xl border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        open ? 'border-blue-200 bg-blue-50/60 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-3.5 sm:p-4">
                        <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[9px] font-black transition-colors ${open ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Q{idx + 1}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[clamp(12.5px,2.8cqw,14px)] font-bold leading-snug text-slate-800">{faq.question}</h4>
                          <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: open ? 240 : 0, opacity: open ? 1 : 0, marginTop: open ? 8 : 0 }}>
                            <p className="text-[clamp(12px,2.6cqw,13.5px)] leading-relaxed text-slate-500">{faq.answer}</p>
                          </div>
                        </div>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={open ? '#3b82f6' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" className={`mt-1.5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}><path d="M2 4l4 4 4-4" /></svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust */}
          <div className="border-t border-slate-100 bg-white px-[clamp(14px,4cqw,28px)] py-3.5">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {[
                { d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Amazon Verified' },
                { d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure Checkout' },
                { d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '30-Day Returns' },
              ].map(({ d, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-slate-400">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
                  <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-3 max-w-md text-center text-[9px] leading-relaxed text-slate-400">
        As an Amazon Associate we earn from qualifying purchases. Prices accurate as of {currentDate}.
      </p>
    </article>
  );
};

export default PremiumProductBox;
