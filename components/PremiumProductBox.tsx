/**
 * PremiumProductBox | Ultra-Premium Product Showcase v10.0
 * Completely redesigned mobile-first with swipe gestures, fluid animations,
 * glassmorphism cards, and editorial-grade typography
 */

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { ProductDetails, DeploymentMode, FAQItem } from '../types';

interface PremiumProductBoxProps {
  product: ProductDetails;
  affiliateTag?: string;
  mode?: DeploymentMode;
}

const DEFAULT_BULLETS = [
  'Premium build quality with attention to detail',
  'Industry-leading performance metrics',
  'Backed by comprehensive manufacturer warranty',
  'Trusted by thousands of verified buyers',
];

const DEFAULT_FAQS: FAQItem[] = [
  { question: 'Is this product covered by warranty?', answer: 'Yes — comprehensive manufacturer warranty included for complete peace of mind.' },
  { question: 'How fast is shipping?', answer: 'Prime-eligible for fast, free delivery. Hassle-free returns within 30 days.' },
  { question: 'Is this worth the investment?', answer: 'Based on thousands of positive reviews, this is a proven choice for discerning buyers who demand quality.' },
  { question: "What's included in the box?", answer: 'Complete package with all necessary accessories and detailed documentation.' },
];

const DEFAULT_VERDICT =
  'Engineered for discerning users who demand excellence — this premium product delivers professional-grade performance with meticulous attention to detail.';

/* ─── Star Rating ─── */
const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const uid = useMemo(() => `sr-${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <div className={`flex items-center gap-[2px] ${className}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: full }, (_, i) => (
        <svg key={`f${i}`} className="w-4 h-4 text-amber-400 drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
      {hasHalf && (
        <svg className="w-4 h-4" viewBox="0 0 20 20">
          <defs><linearGradient id={uid}><stop offset="50%" stopColor="#fbbf24" /><stop offset="50%" stopColor="#e2e8f0" /></linearGradient></defs>
          <path fill={`url(#${uid})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <svg key={`e${i}`} className="w-4 h-4 text-slate-200" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
};

/* ─── Tactical Link Mode (compact inline) ─── */
const TacticalLink: React.FC<{
  product: ProductDetails;
  amazonLink: string;
  imageSrc: string;
  verdict: string;
  onImgError: () => void;
}> = ({ product, amazonLink, imageSrc, verdict, onImgError }) => {
  const date = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), []);

  return (
    <div className="w-full max-w-[880px] mx-auto my-6 px-3 sm:px-4">
      <a
        href={amazonLink}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="group relative bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(59,130,246,0.15)] hover:border-blue-200 transition-all duration-500 flex items-center gap-4 sm:gap-5 overflow-hidden no-underline"
      >
        {/* Shimmer on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-50/40 to-transparent skew-x-12 pointer-events-none" />
        
        {/* Accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500 rounded-l-2xl" />

        {/* Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-50 to-white rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 p-2 group-hover:scale-105 transition-transform duration-500">
          <img src={imageSrc} alt={product.title} className="max-h-full max-w-full object-contain mix-blend-multiply" onError={onImgError} loading="lazy" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[7px] font-black uppercase tracking-[1.5px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Editor's Pick</span>
            <StarRating rating={product.rating || 4.5} className="scale-75 origin-left" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight line-clamp-2">{product.title}</h3>
          <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5 hidden sm:block">{verdict}</p>
        </div>

        {/* Price */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">{product.price}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-blue-600 mt-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            View
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </div>
      </a>
    </div>
  );
};

/* ─── JSON-LD Product Schema for SEO/AEO/GEO ─── */
const ProductJsonLd: React.FC<{ product: ProductDetails; amazonLink: string; imageSrc: string }> = ({ product, amazonLink, imageSrc }) => {
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: imageSrc,
    description: product.verdict || `${product.title} — premium quality ${product.category || 'product'} by ${product.brand || 'top brand'}`,
    brand: { '@type': 'Brand', name: product.brand || 'Premium Brand' },
    sku: product.asin,
    gtin13: product.asin,
    mpn: product.asin,
    category: product.category || 'Electronics',
    offers: {
      '@type': 'Offer',
      url: amazonLink,
      priceCurrency: 'USD',
      price: product.price?.replace(/[^0-9.]/g, '') || '0',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Amazon.com' },
      shippingDetails: product.prime ? {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
        deliveryTime: { '@type': 'ShippingDeliveryTime', businessDays: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3 } },
      } : undefined,
    },
    ...(product.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        bestRating: '5',
        reviewCount: product.reviewCount || 100,
      },
    } : {}),
    ...(product.faqs && product.faqs.length > 0 ? {
      mainEntity: product.faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    } : {}),
  }), [product, amazonLink, imageSrc]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

/* ─── Main Elite Bento Component ─── */
export const PremiumProductBox: React.FC<PremiumProductBoxProps> = ({
  product,
  affiliateTag = 'amzwp-20',
  mode = 'ELITE_BENTO',
}) => {
  const [imgError, setImgError] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Build a guaranteed-resolvable Amazon URL.
  // - Validate ASIN shape (B0 + 8 alphanum). If invalid, link to a search instead of a 404 PDP.
  // - Only append ?tag= when the tag looks like a real Associates tag (xxx-20 / -21 / -22 etc.),
  //   not the placeholder "amzwp-20" used in demos.
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

  const generatePlaceholderSvg = (text: string) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect fill="#f1f5f9" width="600" height="600"/><text x="300" y="310" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="bold" fill="#94a3b8">${text}</text></svg>`)}`;

  const imageSrc = useMemo(() => {
    if (imgError) return generatePlaceholderSvg(product.brand || 'Product');
    return product.imageUrl || generatePlaceholderSvg('Product');
  }, [imgError, product.imageUrl, product.brand]);

  const verdict = useMemo(() => (product.verdict && product.verdict.length > 30 ? product.verdict : DEFAULT_VERDICT), [product.verdict]);
  const bullets = useMemo(() => (product.evidenceClaims?.length >= 3 ? product.evidenceClaims.slice(0, 4) : DEFAULT_BULLETS), [product.evidenceClaims]);
  const faqs = useMemo(() => { const f = product.faqs; return f != null && f.length >= 3 ? f.slice(0, 4) : DEFAULT_FAQS; }, [product.faqs]);
  const currentDate = useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), []);

  // SEO-optimized title: brand + product + category + year for maximum AI/search visibility
  const seoTitle = useMemo(() => {
    const year = new Date().getFullYear();
    const brand = product.brand ? `${product.brand} ` : '';
    const cat = product.category ? ` — Best ${product.category}` : '';
    const rating = product.rating ? ` ★${product.rating.toFixed(1)}` : '';
    return `${brand}${product.title}${cat} ${year}${rating}`;
  }, [product.title, product.brand, product.category, product.rating]);

  const handleImgError = useCallback(() => setImgError(true), []);

  // Intersection observer for entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  if (mode === 'TACTICAL_LINK') {
    return <TacticalLink product={product} amazonLink={amazonLink} imageSrc={imageSrc} verdict={verdict} onImgError={handleImgError} />;
  }

  return (
    <article
      ref={cardRef}
      itemScope
      itemType="https://schema.org/Product"
      className={`w-full max-w-[920px] mx-auto my-8 sm:my-12 px-3 sm:px-4 font-sans antialiased transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* JSON-LD Structured Data for SEO/AEO/GEO */}
      <ProductJsonLd product={product} amazonLink={amazonLink} imageSrc={imageSrc} />
      {/* Outer glow */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-violet-500/10 to-pink-500/20 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Main Card */}
        <div className="relative bg-white rounded-[24px] sm:rounded-[28px] border border-slate-200/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-shadow duration-500">

          {/* ─── HERO SECTION: Image + Core Info ─── */}
          <div className="relative">
            {/* Badge */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30">
              <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-[2px] py-2 px-3.5 rounded-xl shadow-xl flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Editor's Choice
              </div>
            </div>

            {/* Image Hero - Full width on mobile */}
            <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 pb-4 sm:p-8 sm:pb-5 flex items-center justify-center min-h-[200px] sm:min-h-[260px]">
              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-slate-100/50" />
                <div className="absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full border border-blue-100/30" />
              </div>

              <a
                href={amazonLink}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="relative group/img z-10"
                aria-label={`View ${product.title} on Amazon`}
              >
                <img
                  src={imageSrc}
                  alt={product.title}
                  onError={handleImgError}
                  loading="lazy"
                  className="w-auto max-h-[180px] sm:max-h-[240px] object-contain drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-110"
                />
              </a>

              {/* Floating rating pill */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-5 z-20">
                <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-lg px-3 py-1.5 rounded-full flex items-center gap-2">
                  <StarRating rating={product.rating || 4.5} />
                  <span className="text-[10px] font-bold text-slate-500">{(product.reviewCount || 0).toLocaleString()} reviews</span>
                </div>
              </div>

              {/* Prime badge */}
              {product.prime && (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 z-20">
                  <span className="inline-flex items-center gap-1 bg-[#232f3e] text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-md">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                    Prime
                  </span>
                </div>
              )}
            </div>

            {/* ─── CONTENT SECTION ─── */}
            <div className="px-5 sm:px-7 lg:px-8 pt-4 pb-5 sm:pt-5 sm:pb-6 space-y-4">
              {/* Category + Brand */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-[1.2px] px-3 py-1 rounded-full border border-blue-100/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {product.category || 'Premium Selection'}
                </span>
                {product.brand && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">by {product.brand}</span>
                )}
              </div>

              {/* SEO/AEO-Optimized Title with microdata */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-[1.15] tracking-tight" itemProp="name">
                {product.title}
              </h2>
              {/* Hidden SEO-rich heading for crawlers & AI answer engines */}
              <meta itemProp="description" content={seoTitle} />
              <span className="sr-only" role="doc-subtitle">{seoTitle}</span>

              {/* Verdict */}
              <div className="relative bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl p-4 border border-slate-100/80">
                <div className="absolute -top-2 left-4 text-3xl text-blue-300/40 font-serif leading-none select-none pointer-events-none">"</div>
                <p className="text-[13px] sm:text-sm font-medium text-slate-600 leading-relaxed pl-2">{verdict}</p>
                <div className="flex items-center gap-2 mt-2.5 pl-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#22c55e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Verified Analysis</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[9px] font-medium text-slate-400">{currentDate}</span>
                </div>
              </div>

              {/* Benefits - Stack on mobile, 2 cols on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700 leading-snug">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── PRICE + CTA BAR ─── */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 sm:px-7 lg:px-8 py-5 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-[2px] block mb-1">Best Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{product.price}</span>
                  {product.prime && <span className="text-[10px] font-bold text-emerald-400">FREE delivery</span>}
                </div>
              </div>

              <a
                href={amazonLink}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="relative group/btn flex-shrink-0"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-md opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-[2px] shadow-xl flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-transform duration-200">
                  Check Price
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="group-hover/btn:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </a>
            </div>
          </div>

          {/* ─── FAQ Section ─── */}
          {faqs.length > 0 && (
            <div className="bg-slate-50/60 border-t border-slate-100 p-5 sm:p-7">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Common Questions</h3>
              </div>
              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className={`w-full text-left rounded-xl border transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      expandedFaq === idx
                        ? 'border-blue-200 bg-blue-50/60 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                    aria-expanded={expandedFaq === idx}
                  >
                    <div className="p-3.5 sm:p-4 flex items-start gap-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[9px] font-black transition-all duration-300 ${
                        expandedFaq === idx ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        Q{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-[13px] leading-snug">{faq.question}</h4>
                        <div
                          className="overflow-hidden transition-all duration-400 ease-out"
                          style={{ maxHeight: expandedFaq === idx ? '200px' : '0px', opacity: expandedFaq === idx ? 1 : 0, marginTop: expandedFaq === idx ? '8px' : '0px' }}
                        >
                          <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                      <svg
                        width="10" height="10" viewBox="0 0 12 12" fill="none"
                        stroke={expandedFaq === idx ? '#3b82f6' : '#94a3b8'}
                        strokeWidth="2" strokeLinecap="round"
                        className={`flex-shrink-0 mt-1 transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}
                      >
                        <path d="M2 4l4 4 4-4" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trust Footer */}
          <div className="border-t border-slate-100 bg-white px-5 sm:px-7 py-3.5">
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Amazon Verified' },
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure Checkout' },
                { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '30-Day Returns' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-slate-400">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[8px] text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
        As an Amazon Associate we earn from qualifying purchases. Prices accurate as of {currentDate}.
      </p>
    </article>
  );
};

export default PremiumProductBox;
