/**
 * ============================================================================
 * AmzWP-Automator | Type Definitions v90.0
 * ============================================================================
 * 
 * Enterprise-Grade TypeScript Definitions for:
 * - Application Configuration
 * - Blog Post Management
 * - Product Details & Monetization
 * - AI Provider Integration
 * - Editor State Management
 * - Batch Processing
 * - Comparison Tables
 * - Schema.org Structured Data
 * 
 * ============================================================================
 */

// ============================================================================
// AI PROVIDER TYPES
// ============================================================================

/**
 * Supported AI providers for content analysis and product detection
 */
export type AIProvider = 
  | 'gemini'      // Google Gemini (default)
  | 'openai'      // OpenAI GPT-4o
  | 'anthropic'   // Anthropic Claude
  | 'groq'        // Groq (ultra-fast inference)
  | 'openrouter'; // OpenRouter (100+ models)

/**
 * AI provider configuration metadata
 */
export interface AIProviderMeta {
  id: AIProvider;
  name: string;
  description: string;
  defaultModel: string;
  supportsCustomModel: boolean;
  requiresKey: boolean;
  models: AIModelOption[];
}

/**
 * AI model selection option
 */
export interface AIModelOption {
  value: string;
  label: string;
  contextWindow?: number;
  costTier?: 'free' | 'low' | 'medium' | 'high';
}

// ============================================================================
// PRODUCT BOX STYLES
// ============================================================================

/**
 * Product box visual styles
 */
export type BoxStyle = 
  | 'CLASSIC'   // Clean, minimal design
  | 'PREMIUM';  // Luxe aurora design with animations

/**
 * Product deployment modes for different placements
 */
export type DeploymentMode = 
  | 'ELITE_BENTO'    // Full-featured bento box layout
  | 'TACTICAL_LINK'; // Compact inline link style

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

/**
 * Main application configuration interface
 * Stored in localStorage with encryption for sensitive fields
 */
export interface AppConfig {
  // ========== Amazon Associates ==========
  /** Amazon Associates tracking tag (e.g., "yourname-20") */
  amazonTag: string;
  
  /** Amazon Product Advertising API access key (encrypted) */
  amazonAccessKey: string;
  
  /** Amazon Product Advertising API secret key (encrypted) */
  amazonSecretKey: string;
  
  /** Amazon marketplace region */
  amazonRegion: AmazonRegion;

  // ========== WordPress Integration ==========
  /** WordPress site URL (without trailing slash) */
  wpUrl: string;
  
  /** WordPress username */
  wpUser: string;
  
  /** WordPress application password (encrypted) */
  wpAppPassword: string;

  // ========== API Keys (All Encrypted) ==========
  /** SerpAPI key for product lookups */
  serpApiKey?: string;
  
  /** Google Gemini API key */
  geminiApiKey?: string;
  
  /** OpenAI API key */
  openaiApiKey?: string;
  
  /** Anthropic Claude API key */
  anthropicApiKey?: string;
  
  /** Groq API key */
  groqApiKey?: string;
  
  /** OpenRouter API key */
  openrouterApiKey?: string;

  // ========== AI Configuration ==========
  /** Selected AI provider */
  aiProvider: AIProvider;
  
  /** Selected AI model */
  aiModel: string;
  
  /** Custom model name (for Groq/OpenRouter) */
  customModel?: string;

  // ========== Application Settings ==========
  /** Confidence threshold for auto-publish (0-100) */
  autoPublishThreshold: number;
  
  /** Maximum concurrent API requests */
  concurrencyLimit: number;
  
  /** Enable JSON-LD schema injection */
  enableSchema: boolean;
  
  /** Enable precision product placement */
  enableStickyBar: boolean;
  
  /** Selected product box style */
  boxStyle: BoxStyle;

  // ========== SerpAPI Budget Controls ==========
  /**
   * Hard cap on SerpAPI calls per scan. When the budget is reached, the
   * scanner stops issuing new requests and returns whatever was found.
   * Defaults to 8 if unset.
   */
  serpApiCallBudget?: number;

  /**
   * Minimum candidate relevance score required before a SerpAPI call is
   * spent on it. Lower = more aggressive lookups, higher = more selective.
   * Defaults to 35 if unset.
   */
  serpApiMinCandidateScore?: number;
}

/**
 * Amazon marketplace regions
 */
export type AmazonRegion = 
  | 'us-east-1'       // United States
  | 'eu-west-1'       // United Kingdom
  | 'eu-west-2'       // Germany
  | 'eu-west-3'       // France
  | 'ap-northeast-1'  // Japan
  | 'ap-south-1'      // India
  | 'ap-southeast-1'  // Singapore
  | 'ap-southeast-2'; // Australia

/**
 * Amazon region metadata
 */
export interface AmazonRegionMeta {
  id: AmazonRegion;
  name: string;
  domain: string;
  flag: string;
}

// ============================================================================
// BLOG POST TYPES
// ============================================================================

/**
 * Post priority levels for monetization opportunities
 */
export type PostPriority = 
  | 'critical'  // High-value, high-intent content
  | 'high'      // Good monetization potential
  | 'medium'    // Moderate potential
  | 'low';      // Low priority or already monetized

/**
 * Post monetization status
 */
export type MonetizationStatus = 
  | 'monetized'    // Already has working affiliate / Amazon product boxes
  | 'broken'       // Has product boxes but they're broken (missing image, ASIN, price, or link)
  | 'opportunity'; // Available for monetization

/**
 * Content type classification
 */
export type ContentType = 
  | 'post'        // Standard blog post
  | 'page'        // Static page
  | 'review'      // Product review
  | 'listicle'    // List-based article (e.g., "Top 10...")
  | 'how-to'      // Tutorial/guide
  | 'comparison'  // Product comparison
  | 'news'        // News article
  | 'unknown';    // Unclassified

/**
 * Blog post representation
 */
export interface BlogPost {
  /** Unique identifier (WordPress post ID or generated) */
  id: number;
  
  /** Post title */
  title: string;
  
  /** Full URL to the post */
  url: string;
  
  /** Raw HTML content (optional, fetched on demand) */
  content?: string;
  
  /** Content type classification */
  postType: ContentType | string;
  
  /** Monetization priority level */
  priority: PostPriority;
  
  /** Current monetization status */
  monetizationStatus: MonetizationStatus;
  
  /** Products already placed in this post */
  activeProducts?: ProductDetails[];
  
  /** Last modification timestamp */
  lastModified?: number;
  
  /** WordPress post status */
  status?: 'publish' | 'draft' | 'pending' | 'private';
  
  /** Post excerpt/summary */
  excerpt?: string;
  
  /** Featured image URL */
  featuredImage?: string;
  
  /** Post categories */
  categories?: string[];
  
  /** Post tags */
  tags?: string[];
  
  /** Author name */
  author?: string;
  
  /** Publication date */
  publishedAt?: string;
  
  /** Word count */
  wordCount?: number;
  
  /** Estimated reading time (minutes) */
  readingTime?: number;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

/**
 * FAQ item for product boxes
 */
export interface FAQItem {
  /** Question text */
  question: string;
  
  /** Answer text */
  answer: string;
}

/**
 * Product specification entry
 */
export interface ProductSpec {
  /** Specification name */
  name: string;
  
  /** Specification value */
  value: string;
  
  /** Optional unit (e.g., "inches", "lbs") */
  unit?: string;
}

/**
 * Product image variant
 */
export interface ProductImage {
  /** Image URL */
  url: string;
  
  /** Image alt text */
  alt?: string;
  
  /** Image type */
  type: 'main' | 'gallery' | 'variant';
  
  /** Image dimensions */
  width?: number;
  height?: number;
}

/**
 * Product price information
 */
export interface ProductPrice {
  /** Current price as string (e.g., "$29.99") */
  current: string;
  
  /** Original price if on sale */
  original?: string;
  
  /** Discount percentage */
  discountPercent?: number;
  
  /** Price currency code */
  currency?: string;
  
  /** Whether price is per unit, per month, etc. */
  priceType?: 'one-time' | 'subscription' | 'per-unit';
}

/**
 * Complete product details
 */
export interface ProductDetails {
  /** Unique product identifier */
  id: string;
  
  /** Amazon Standard Identification Number */
  asin: string;
  
  /** Product title */
  title: string;
  
  /** Display price (e.g., "$29.99") */
  price: string;
  
  /** Detailed price information */
  priceInfo?: ProductPrice;
  
  /** Main product image URL */
  imageUrl: string;
  
  /** Additional product images */
  images?: ProductImage[];
  
  /** Average star rating (0-5) */
  rating: number;
  
  /** Total number of reviews */
  reviewCount: number;
  
  /** AI-generated product verdict/summary */
  verdict: string;
  
  /** Key product benefits/claims */
  evidenceClaims: string[];
  
  /** Product brand name */
  brand?: string;
  
  /** Product category */
  category?: string;
  
  /** Prime eligibility */
  prime?: boolean;
  
  /** Stock availability */
  inStock?: boolean;
  
  /** Target insertion index in content */
  insertionIndex: number;
  
  /** Selected deployment style */
  deploymentMode: DeploymentMode;
  
  /** FAQ items for the product */
  faqs?: FAQItem[];
  
  /** Product specifications */
  specs?: Record<string, string>;
  
  /** Detailed specifications */
  specifications?: ProductSpec[];
  
  /** Product description */
  description?: string;
  
  /** Product features list */
  features?: string[];
  
  /** Pros list */
  pros?: string[];
  
  /** Cons list */
  cons?: string[];
  
  /** Best for use cases */
  bestFor?: string[];
  
  /** Product variants (colors, sizes, etc.) */
  variants?: ProductVariant[];
  
  /** Related product ASINs */
  relatedProducts?: string[];
  
  /** Last updated timestamp */
  lastUpdated?: number;
  
  /** Data source */
  source?: 'serpapi' | 'pa-api' | 'manual' | 'ai';
  
  /** Confidence score (0-100) */
  confidence?: number;

  /** Exact text quote where product was mentioned in content */
  exactMention?: string;

  /** Block index where product was mentioned (for precise placement) */
  mentionBlockIndex?: number;

  /** Paragraph number in original content */
  paragraphIndex?: number;
}

/**
 * Product variant (color, size, etc.)
 */
export interface ProductVariant {
  /** Variant identifier */
  id: string;
  
  /** Variant name (e.g., "Blue", "Large") */
  name: string;
  
  /** Variant type */
  type: 'color' | 'size' | 'style' | 'other';
  
  /** Variant-specific ASIN */
  asin?: string;
  
  /** Variant-specific price */
  price?: string;
  
  /** Variant image URL */
  imageUrl?: string;
  
  /** Whether variant is available */
  available?: boolean;
}

// ============================================================================
// COMPARISON TABLE TYPES
// ============================================================================

/**
 * Comparison table configuration
 */
export interface ComparisonData {
  /** Table title */
  title: string;
  
  /** Product IDs to compare */
  productIds: string[];
  
  /** Specification keys to display */
  specs: string[];
  
  /** Whether to show winner badge */
  showWinner?: boolean;
  
  /** Winner product ID */
  winnerId?: string;
  
  /** Table layout style */
  layout?: 'horizontal' | 'vertical';
  
  /** Maximum products to show */
  maxProducts?: number;
}

/**
 * Comparison table cell data
 */
export interface ComparisonCell {
  /** Product ID */
  productId: string;
  
  /** Specification key */
  specKey: string;
  
  /** Display value */
  value: string;
  
  /** Whether this is the best value */
  isBest?: boolean;
  
  /** Cell type for styling */
  type?: 'text' | 'rating' | 'price' | 'boolean';
}

// ============================================================================
// APPLICATION STATE TYPES
// ============================================================================

/**
 * Application navigation steps
 */
export enum AppStep {
  LANDING = 'LANDING',
  SITEMAP = 'SITEMAP',
  EDITOR = 'EDITOR',
}

/**
 * Sitemap scanner state
 */
export interface SitemapState {
  /** Scanned URL/domain */
  url: string;
  
  /** Discovered posts */
  posts: BlogPost[];
  
  /** Last scan timestamp */
  lastScanned?: number;
  
  /** Scan status */
  status?: 'idle' | 'scanning' | 'auditing' | 'complete' | 'error';
  
  /** Error message if any */
  error?: string;
  
  /** Total pages found */
  totalFound?: number;
  
  /** Pages processed */
  processed?: number;
}

// ============================================================================
// EDITOR TYPES
// ============================================================================

/**
 * Editor node types
 */
export type EditorNodeType = 
  | 'HTML'        // Raw HTML content block
  | 'PRODUCT'     // Product box
  | 'COMPARISON'  // Comparison table
  | 'HEADING'     // Section heading
  | 'IMAGE'       // Image block
  | 'DIVIDER';    // Visual divider

/**
 * Visual editor node
 */
export interface EditorNode {
  /** Unique node identifier */
  id: string;
  
  /** Node type */
  type: EditorNodeType;
  
  /** HTML content (for HTML type) */
  content?: string;
  
  /** Product ID reference (for PRODUCT type) */
  productId?: string;
  
  /** Comparison configuration (for COMPARISON type) */
  comparisonData?: ComparisonData;
  
  /** Node metadata */
  meta?: EditorNodeMeta;
}

/**
 * Editor node metadata
 */
export interface EditorNodeMeta {
  /** Creation timestamp */
  createdAt?: number;
  
  /** Last modified timestamp */
  modifiedAt?: number;
  
  /** Whether node is collapsed in UI */
  collapsed?: boolean;
  
  /** Whether node is locked from editing */
  locked?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

/**
 * Editor history entry
 */
export interface EditorHistoryEntry {
  /** Snapshot of editor nodes */
  nodes: EditorNode[];
  
  /** Snapshot of product map */
  productMap: Record<string, ProductDetails>;
  
  /** Timestamp */
  timestamp: number;
  
  /** Action description */
  action?: string;
}

// ============================================================================
// BATCH PROCESSING TYPES
// ============================================================================

/**
 * Batch job status
 */
export type BatchJobStatus = 
  | 'queued'      // Waiting to process
  | 'processing'  // Currently processing
  | 'completed'   // Successfully completed
  | 'failed'      // Failed with error
  | 'skipped'     // Skipped (aborted or filtered)
  | 'paused';     // Paused by user

/**
 * Batch processing job
 */
export interface BatchJob {
  /** Unique job identifier */
  id: string;
  
  /** Associated blog post */
  post: BlogPost;
  
  /** Current status */
  status: BatchJobStatus;
  
  /** Progress percentage (0-100) */
  progress: number;
  
  /** Number of products found */
  productsFound: number;
  
  /** Error message if failed */
  error?: string;
  
  /** Processing start time */
  startTime?: number;
  
  /** Processing end time */
  endTime?: number;
  
  /** Retry attempt count */
  retryCount?: number;
  
  /** Products detected */
  products?: ProductDetails[];
  
  /** Generated content HTML */
  generatedContent?: string;
}

/**
 * Batch processing configuration
 */
export interface BatchConfig {
  /** Number of concurrent jobs */
  concurrency: number;
  
  /** Auto-publish after processing */
  autoPublish: boolean;
  
  /** Auto-place products in content */
  autoPlace: boolean;
  
  /** Maximum retry attempts */
  maxRetries: number;
  
  /** Delay between jobs (ms) */
  delayBetweenJobs?: number;
  
  /** Skip already monetized posts */
  skipMonetized?: boolean;
  
  /** Minimum confidence threshold */
  minConfidence?: number;
}

/**
 * Batch processing statistics
 */
export interface BatchStats {
  /** Total jobs */
  total: number;
  
  /** Completed jobs */
  completed: number;
  
  /** Failed jobs */
  failed: number;
  
  /** Currently processing */
  processing: number;
  
  /** Queued jobs */
  queued: number;
  
  /** Skipped jobs */
  skipped: number;
  
  /** Total products found */
  productsFound: number;
  
  /** Average processing time (ms) */
  avgTime: number;
  
  /** Estimated remaining time (ms) */
  estimatedRemaining: number;
  
  /** Start timestamp */
  startedAt?: number;
  
  /** End timestamp */
  completedAt?: number;
}

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

/**
 * AI content analysis result
 */
export interface AnalysisResult {
  /** Detected products */
  detectedProducts: ProductDetails[];
  
  /** Comparison table suggestion */
  comparison?: ComparisonData;
  
  /** Content type classification */
  contentType: ContentType | string;
  
  /** Monetization potential assessment */
  monetizationPotential: 'high' | 'medium' | 'low';
  
  /** Suggested keywords */
  keywords?: string[];
  
  /** Suggested product placements */
  suggestedPlacements?: number[];
  
  /** Analysis confidence score */
  confidence?: number;
  
  /** Processing time (ms) */
  processingTime?: number;

  /** Detailed scan telemetry — populated by the scanner */
  scanReport?: ScanReport;
}

/**
 * Reason a candidate product was not turned into a final placement.
 */
export type SkipReason =
  | 'budget_exhausted'
  | 'low_score'
  | 'duplicate'
  | 'serpapi_error'
  | 'serpapi_rate_limit'
  | 'no_amazon_match'
  | 'invalid_query'
  | 'fatal_serpapi';

export interface SkippedCandidate {
  name: string;
  reason: SkipReason;
  detail?: string;
  confidence?: number;
}

export interface ScanReport {
  /** Total SerpAPI HTTP calls actually issued during the scan */
  serpApiCallsUsed: number;

  /** SerpAPI call budget for this scan */
  serpApiCallBudget: number;

  /** True if the scanner stopped because the budget was reached */
  budgetExhausted: boolean;

  /** Total retries spent on backoff (rate limit / transient errors) */
  serpApiRetries: number;

  /** Number of candidates considered before SerpAPI verification */
  candidatesEvaluated: number;

  /** Number of candidates that survived selection and produced a product */
  productsKept: number;

  /** Per-candidate skip log so the UI can explain decisions */
  skipped: SkippedCandidate[];

  /** Stage-by-stage timeline */
  stages: Array<{ name: string; durationMs: number }>;
}

/**
 * AI-enhanced product copy
 */
export interface EnhancedCopy {
  /** Product verdict */
  verdict: string;
  
  /** Attention-grabbing headline */
  headline: string;
  
  /** Benefit bullet points */
  bulletPoints: string[];
  
  /** Call-to-action text */
  callToAction: string;
  
  /** FAQ items */
  faqs: FAQItem[];
  
  /** Urgency/scarcity hook */
  urgencyHook: string;
  
  /** SEO-optimized title */
  seoTitle?: string;
  
  /** Meta description */
  metaDescription?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * WordPress REST API post response
 */
export interface WPPostResponse {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  link: string;
  title: { rendered: string; raw?: string };
  content: { rendered: string; raw?: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
}

/**
 * WordPress REST API user response
 */
export interface WPUserResponse {
  id: number;
  name: string;
  slug: string;
  roles: string[];
  avatar_urls: Record<string, string>;
}

/**
 * SerpAPI Amazon product response
 */
export interface SerpAPIProductResponse {
  asin: string;
  title: string;
  link: string;
  image: string;
  thumbnail: string;
  rating: number;
  reviews: string;
  price: { raw: string; current: string; original?: string };
  is_prime: boolean;
  brand: string;
  category?: { name: string }[];
  feature_bullets?: string[];
}

/**
 * AI provider response
 */
export interface AIProviderResponse {
  /** Generated text */
  text: string;
  
  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens?: number;
  };
  
  /** Model used */
  model?: string;
  
  /** Finish reason */
  finishReason?: string;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

/**
 * Cache entry wrapper
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T;
  
  /** Cache timestamp */
  timestamp: number;
  
  /** Cache version */
  version: string;
  
  /** Time-to-live in ms */
  ttl?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of entries */
  entries: number;
  
  /** Total size in bytes */
  size: number;
  
  /** Oldest entry timestamp */
  oldest: number;
  
  /** Hit rate percentage */
  hitRate?: number;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Application event types
 */
export type AppEventType =
  | 'POST_SELECTED'
  | 'POST_SAVED'
  | 'PRODUCT_ADDED'
  | 'PRODUCT_REMOVED'
  | 'ANALYSIS_COMPLETE'
  | 'BATCH_STARTED'
  | 'BATCH_COMPLETED'
  | 'CONFIG_UPDATED'
  | 'ERROR_OCCURRED';

/**
 * Application event
 */
export interface AppEvent {
  type: AppEventType;
  payload?: unknown;
  timestamp: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Async operation result
 */
export type AsyncResult<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  perPage: number;
  total?: number;
  totalPages?: number;
}

/**
 * Sort configuration
 */
export interface SortConfig<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig<T> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: unknown;
}

// ============================================================================
// CONSTANTS (Type-safe)
// ============================================================================

/**
 * Default application configuration
 */
export const DEFAULT_CONFIG: AppConfig = {
  amazonTag: '',
  amazonAccessKey: '',
  amazonSecretKey: '',
  amazonRegion: 'us-east-1',
  wpUrl: '',
  wpUser: '',
  wpAppPassword: '',
  serpApiKey: '',
  geminiApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  groqApiKey: '',
  openrouterApiKey: '',
  aiProvider: 'gemini',
  aiModel: 'gemini-2.0-flash',
  customModel: '',
  autoPublishThreshold: 85,
  concurrencyLimit: 5,
  enableSchema: true,
  enableStickyBar: true,
  boxStyle: 'PREMIUM',
  serpApiCallBudget: 8,
  serpApiMinCandidateScore: 35,
};

/**
 * Amazon region metadata
 */
export const AMAZON_REGIONS: AmazonRegionMeta[] = [
  { id: 'us-east-1', name: 'United States', domain: 'amazon.com', flag: '🇺🇸' },
  { id: 'eu-west-1', name: 'United Kingdom', domain: 'amazon.co.uk', flag: '🇬🇧' },
  { id: 'eu-west-2', name: 'Germany', domain: 'amazon.de', flag: '🇩🇪' },
  { id: 'eu-west-3', name: 'France', domain: 'amazon.fr', flag: '🇫🇷' },
  { id: 'ap-northeast-1', name: 'Japan', domain: 'amazon.co.jp', flag: '🇯🇵' },
  { id: 'ap-south-1', name: 'India', domain: 'amazon.in', flag: '🇮🇳' },
  { id: 'ap-southeast-2', name: 'Australia', domain: 'amazon.com.au', flag: '🇦🇺' },
];

/**
 * AI provider metadata
 */
export const AI_PROVIDERS: AIProviderMeta[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Fast and accurate with excellent JSON output',
    defaultModel: 'gemini-2.0-flash',
    supportsCustomModel: false,
    requiresKey: true,
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recommended)' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Highest quality analysis with GPT-4o',
    defaultModel: 'gpt-4o',
    supportsCustomModel: false,
    requiresKey: true,
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Excellent reasoning with Claude 3.5',
    defaultModel: 'claude-3-5-sonnet-20241022',
    supportsCustomModel: false,
    requiresKey: true,
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference speeds',
    defaultModel: 'llama-3.3-70b-versatile',
    supportsCustomModel: true,
    requiresKey: true,
    models: [],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to 100+ models from one API',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    supportsCustomModel: true,
    requiresKey: true,
    models: [],
  },
];

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid AIProvider
 */
export const isAIProvider = (value: unknown): value is AIProvider => {
  return typeof value === 'string' && 
    ['gemini', 'openai', 'anthropic', 'groq', 'openrouter'].includes(value);
};

/**
 * Check if value is a valid BoxStyle
 */
export const isBoxStyle = (value: unknown): value is BoxStyle => {
  return typeof value === 'string' && ['CLASSIC', 'PREMIUM'].includes(value);
};

/**
 * Check if value is a valid DeploymentMode
 */
export const isDeploymentMode = (value: unknown): value is DeploymentMode => {
  return typeof value === 'string' && ['ELITE_BENTO', 'TACTICAL_LINK'].includes(value);
};

/**
 * Check if value is a valid PostPriority
 */
export const isPostPriority = (value: unknown): value is PostPriority => {
  return typeof value === 'string' && 
    ['critical', 'high', 'medium', 'low'].includes(value);
};

/**
 * Check if object is a valid BlogPost
 */
export const isBlogPost = (obj: unknown): obj is BlogPost => {
  if (typeof obj !== 'object' || obj === null) return false;
  const post = obj as Record<string, unknown>;
  return (
    typeof post.id === 'number' &&
    typeof post.title === 'string' &&
    typeof post.url === 'string'
  );
};

/**
 * Check if object is a valid ProductDetails
 */
export const isProductDetails = (obj: unknown): obj is ProductDetails => {
  if (typeof obj !== 'object' || obj === null) return false;
  const product = obj as Record<string, unknown>;
  return (
    typeof product.id === 'string' &&
    typeof product.asin === 'string' &&
    typeof product.title === 'string'
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DEFAULT_CONFIG,
  AMAZON_REGIONS,
  AI_PROVIDERS,
  isAIProvider,
  isBoxStyle,
  isDeploymentMode,
  isPostPriority,
  isBlogPost,
  isProductDetails,
};
