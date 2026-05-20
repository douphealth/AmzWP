/**
 * Amazon Product Advertising API 5.0 client (server-only).
 * SigV4-signed JSON requests for GetItems and SearchItems.
 *
 * Returns a normalized Partial<ProductDetails>-shaped payload that the
 * existing detection pipeline can consume as a drop-in fallback when no
 * SerpAPI key is configured.
 */
import { createServerFn } from '@tanstack/react-start';
import { createHash, createHmac } from 'crypto';

// ────────────────────────────────────────────────────────────────────────────
// Region → host mapping. config.amazonRegion uses AWS region codes; map each
// to its PA-API marketplace host. Unmapped regions fall back to US.
// ────────────────────────────────────────────────────────────────────────────
const REGION_MAP: Record<string, { host: string; region: string; marketplace: string }> = {
  'us-east-1': { host: 'webservices.amazon.com', region: 'us-east-1', marketplace: 'www.amazon.com' },
  'us-west-2': { host: 'webservices.amazon.com', region: 'us-east-1', marketplace: 'www.amazon.com' },
  'eu-west-1': { host: 'webservices.amazon.co.uk', region: 'eu-west-1', marketplace: 'www.amazon.co.uk' },
  'eu-central-1': { host: 'webservices.amazon.de', region: 'eu-west-1', marketplace: 'www.amazon.de' },
  'ap-northeast-1': { host: 'webservices.amazon.co.jp', region: 'us-west-2', marketplace: 'www.amazon.co.jp' },
  'ap-southeast-1': { host: 'webservices.amazon.sg', region: 'us-west-2', marketplace: 'www.amazon.sg' },
  'ap-southeast-2': { host: 'webservices.amazon.com.au', region: 'us-west-2', marketplace: 'www.amazon.com.au' },
};

const RESOURCES = [
  'Images.Primary.Large',
  'Images.Primary.Medium',
  'ItemInfo.Title',
  'ItemInfo.ByLineInfo',
  'ItemInfo.Features',
  'ItemInfo.Classifications',
  'ItemInfo.ProductInfo',
  'Offers.Listings.Price',
  'Offers.Listings.DeliveryInfo.IsPrimeEligible',
  'Offers.Listings.SavingBasis',
];

function sha256Hex(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}
function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}
function toAmzDate(d = new Date()): { amzDate: string; dateStamp: string } {
  const iso = d.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amzDate: iso, dateStamp: iso.substring(0, 8) };
}

interface PaapiCreds {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region?: string;
}

async function signedPaapiCall(
  creds: PaapiCreds,
  operation: 'GetItems' | 'SearchItems',
  payload: Record<string, unknown>,
): Promise<any> {
  const r = REGION_MAP[creds.region || 'us-east-1'] || REGION_MAP['us-east-1'];
  const path = operation === 'GetItems' ? '/paapi5/getitems' : '/paapi5/searchitems';
  const service = 'ProductAdvertisingAPI';
  const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`;
  const body = JSON.stringify(payload);
  const { amzDate, dateStamp } = toAmzDate();

  const headers: Record<string, string> = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=UTF-8',
    'host': r.host,
    'x-amz-date': amzDate,
    'x-amz-target': target,
  };

  const signedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('');
  const signedHeaders = signedHeaderKeys.join(';');
  const payloadHash = sha256Hex(body);

  const canonicalRequest = [
    'POST',
    path,
    '', // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${r.region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmac(`AWS4${creds.secretKey}`, dateStamp);
  const kRegion = hmac(kDate, r.region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${creds.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${r.host}${path}`, {
    method: 'POST',
    headers: { ...headers, Authorization: authorization },
    body,
  });

  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error */ }

  if (!res.ok) {
    const errMsg =
      json?.Errors?.[0]?.Message ||
      json?.__type ||
      text?.substring(0, 200) ||
      `PA-API HTTP ${res.status}`;
    const code = json?.Errors?.[0]?.Code || '';
    throw new Error(`PA-API ${res.status}${code ? ` (${code})` : ''}: ${errMsg}`);
  }

  // Even on 200, PA-API returns an Errors array for per-item failures.
  if (json?.Errors?.length && !json?.ItemsResult && !json?.SearchResult) {
    const e = json.Errors[0];
    throw new Error(`PA-API: ${e.Code || ''} ${e.Message || 'Unknown error'}`);
  }

  return { json, marketplace: r.marketplace };
}

function pickImage(item: any): string {
  return (
    item?.Images?.Primary?.Large?.URL ||
    item?.Images?.Primary?.Medium?.URL ||
    item?.Images?.Primary?.Small?.URL ||
    ''
  );
}
function pickPrice(item: any): string {
  const listing = item?.Offers?.Listings?.[0];
  return listing?.Price?.DisplayAmount || '$XX.XX';
}
function pickPrime(item: any): boolean {
  return !!item?.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible;
}
function pickBrand(item: any): string {
  return item?.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || item?.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || '';
}
function pickTitle(item: any): string {
  return item?.ItemInfo?.Title?.DisplayValue || '';
}
function pickFeatures(item: any): string[] {
  const f = item?.ItemInfo?.Features?.DisplayValues;
  return Array.isArray(f) ? f.slice(0, 6) : [];
}

function mapItem(item: any) {
  if (!item?.ASIN) return null;
  return {
    asin: item.ASIN as string,
    title: pickTitle(item),
    price: pickPrice(item),
    imageUrl: pickImage(item),
    rating: 4.5,            // PA-API doesn't return star rating in the public resource set
    reviewCount: 0,
    prime: pickPrime(item),
    brand: pickBrand(item),
    features: pickFeatures(item),
  };
}

const inputSchema = (i: any) => ({
  accessKey: String(i?.accessKey || '').trim(),
  secretKey: String(i?.secretKey || '').trim(),
  partnerTag: String(i?.partnerTag || '').trim(),
  region: String(i?.region || 'us-east-1'),
  asin: i?.asin ? String(i.asin).trim().toUpperCase() : undefined,
  keyword: i?.keyword ? String(i.keyword).trim() : undefined,
});

function assertCreds(c: ReturnType<typeof inputSchema>) {
  if (!c.accessKey || !c.secretKey || !c.partnerTag) {
    throw new Error('Missing Amazon PA-API credentials (Access Key, Secret Key, Partner Tag).');
  }
}

export const paapiGetItem = createServerFn({ method: 'POST' })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    assertCreds(data);
    if (!data.asin || !/^[A-Z0-9]{10}$/.test(data.asin)) {
      throw new Error('Invalid ASIN for PA-API GetItem.');
    }
    const r = REGION_MAP[data.region] || REGION_MAP['us-east-1'];
    const { json } = await signedPaapiCall(
      { accessKey: data.accessKey, secretKey: data.secretKey, partnerTag: data.partnerTag, region: data.region },
      'GetItems',
      {
        ItemIds: [data.asin],
        ItemIdType: 'ASIN',
        Resources: RESOURCES,
        PartnerTag: data.partnerTag,
        PartnerType: 'Associates',
        Marketplace: r.marketplace,
      },
    );
    const item = json?.ItemsResult?.Items?.[0];
    const mapped = mapItem(item);
    if (!mapped) {
      throw new Error('PA-API returned no item for that ASIN.');
    }
    return { ok: true as const, product: mapped };
  });

export const paapiSearchItem = createServerFn({ method: 'POST' })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    assertCreds(data);
    const keyword = (data.keyword || '').slice(0, 200);
    if (!keyword) throw new Error('Missing keyword for PA-API SearchItems.');
    const r = REGION_MAP[data.region] || REGION_MAP['us-east-1'];
    const { json } = await signedPaapiCall(
      { accessKey: data.accessKey, secretKey: data.secretKey, partnerTag: data.partnerTag, region: data.region },
      'SearchItems',
      {
        Keywords: keyword,
        SearchIndex: 'All',
        ItemCount: 3,
        Resources: RESOURCES,
        PartnerTag: data.partnerTag,
        PartnerType: 'Associates',
        Marketplace: r.marketplace,
      },
    );
    const items: any[] = json?.SearchResult?.Items || [];
    const first = items.find((i) => pickImage(i)) || items[0];
    const mapped = first ? mapItem(first) : null;
    if (!mapped) return { ok: true as const, product: null };
    return { ok: true as const, product: mapped };
  });
