import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { Listing, ParseResult, SearchParams } from './types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
];

const CITY_URL_MAP: Record<string, string> = {
  'москва': 'moskva',
  'moscow': 'moskva',
  'санкт-петербург': 'sankt-peterburg',
  'петербург': 'sankt-peterburg',
  'питер': 'sankt-peterburg',
  'новосибирск': 'novosibirsk',
  'екатеринбург': 'ekaterinburg',
  'казань': 'kazan',
  'нижний новгород': 'nizhnij-novgorod',
  'челябинск': 'chelyabinsk',
  'самара': 'samara',
  'омск': 'omsk',
  'ростов-на-дону': 'rostov-na-donu',
  'уфа': 'ufa',
  'красноярск': 'krasnoyarsk',
  'воронеж': 'voronezh',
  'пермь': 'perm',
  'волгоград': 'volgograd',
};

const CATEGORY_MAP: Record<string, string> = {
  'услуги': 'uslugi',
  'services': 'uslugi',
  'недвижимость': 'nedvizhimost',
  'транспорт': 'transport',
  'работа': 'rabota',
  'электроника': 'elektronika',
};

const requestTimestamps: number[] = [];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function normalizeCity(city: string): string {
  return CITY_URL_MAP[city.toLowerCase().trim()] || city.toLowerCase().trim();
}

function normalizeCategory(category: string): string {
  return CATEGORY_MAP[category.toLowerCase().trim()] || category.toLowerCase().trim();
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(Math.floor(Math.random() * 4000) + 2000);
}

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 3600000) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= 80) {
    const oldest = requestTimestamps[0];
    const waitTime = oldest + 3600000 - now;
    await delay(waitTime + 1000);
  }
  requestTimestamps.push(Date.now());
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await enforceRateLimit();
      const response = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      if (attempt < retries) {
        await delay(attempt * 2000);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) * 100 : 0;
}

function extractImages($: cheerio.CheerioAPI, item: cheerio.Cheerio<AnyNode>): string[] {
  const images: string[] = [];
  item.find('img[itemProp="image"], img[data-marker="item-photo/img"]').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src && !src.includes('svg') && !src.includes('icon') && src.includes('avito.st')) {
      images.push(src.startsWith('//') ? `https:${src}` : src);
    }
  });
  return images;
}

function parseListingFromSearch($: cheerio.CheerioAPI, item: cheerio.Cheerio<AnyNode>): Listing | null {
  try {
    // Item ID from data-item-id attribute
    const avitoId = item.attr('data-item-id') || '';
    if (!avitoId) return null;

    // Title from a[data-marker="item-title"]
    const titleEl = item.find('a[data-marker="item-title"]');
    const title = titleEl.attr('title') || titleEl.text().trim() || '';

    // URL
    const href = titleEl.attr('href') || '';
    const url = href.startsWith('http') ? href : `https://www.avito.ru${href.split('?')[0]}`;

    // Price
    const priceEl = item.find('[itemProp="price"], [data-marker="item-price"]');
    const priceContent = priceEl.attr('content') || priceEl.text().trim() || '0';
    const price = parseInt(priceContent, 10) || parsePrice(priceContent);

    // Location
    const locationEl = item.find('[data-marker="item-address"], [itemProp="availableAtOrFrom"]');
    const locationText = locationEl.text().trim() || '';
    const locationParts = locationText.split(',').map((s: string) => s.trim());

    // Images
    const images = extractImages($, item);

    // Description snippet
    const descEl = item.find('p, [data-marker="item-snippet"]');
    const description = descEl.first().text().trim() || '';

    // Seller info
    const sellerNameEl = item.find('a[data-marker="item-link"], [data-marker="seller-name"]');
    const sellerName = sellerNameEl.text().trim() || '';

    // Seller type
    const sellerTypeText = item.find('[data-marker="seller-label"], [data-marker="business-label"]').text();
    const sellerType: 'private' | 'business' = sellerTypeText.includes('Бизнес') ? 'business' : 'private';

    // Seller rating
    const ratingText = item.find('[data-marker="seller-rating/score"]').text().trim();

    return {
      avito_id: avitoId,
      title,
      description,
      price: price || 0,
      price_formatted: price ? `${price} ₽` : 'Договорная',
      city: locationParts[0] || '',
      district: locationParts[1] || '',
      address: locationText,
      category: '',
      subcategory: '',
      seller_id: '',
      seller_name: sellerName,
      seller_type: sellerType,
      url,
      images,
      image_count: images.length,
      date_created: '',
      date_parsed: new Date().toISOString(),
      date_updated: new Date().toISOString(),
      status: 'active',
      text_quality_score: 0,
      uniqueness_score: 0,
      image_quality_score: 0,
      overall_score: 0,
      views_estimate: 0,
      favorites_count: 0,
      response_time: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

function parseSearchPage(html: string, page: number): ParseResult {
  const $ = cheerio.load(html);
  const listings: Listing[] = [];

  // Avito uses div[data-marker="item"] for each listing
  const items = $('div[data-marker="item"]');

  items.each((_, element) => {
    const listing = parseListingFromSearch($, $(element));
    if (listing && listing.title) {
      listings.push(listing);
    }
  });

  // Try to get total count from search-found-count or page title
  const totalText = $('[data-marker="search-found-count"]').text().trim() ||
    $('h1').first().text().match(/(\d+)/)?.[1] || '0';
  const total = parseInt(totalText, 10) || listings.length;

  // Check for "next page" link
  const hasNext = $('a[data-marker="pagination-button/next"]').length > 0 ||
    $('a[rel="next"]').length > 0;

  return {
    listings,
    total: total || listings.length,
    page,
    hasMore: hasNext || listings.length >= 50,
  };
}

export async function searchListings(params: SearchParams): Promise<ParseResult> {
  const { query, city, category, priceMin, priceMax, page = 1, sort } = params;

  const citySlug = city ? normalizeCity(city) : '';
  const categorySlug = category ? normalizeCategory(category) : 'uslugi';

  let url = 'https://www.avito.ru';
  if (citySlug) url += `/${citySlug}`;
  if (categorySlug) url += `/${categorySlug}`;

  const searchParams = new URLSearchParams();
  if (query) searchParams.set('q', query);
  if (page > 1) searchParams.set('p', page.toString());
  if (priceMin) searchParams.set('priceMin', priceMin.toString());
  if (priceMax) searchParams.set('priceMax', priceMax.toString());
  if (sort === 'price_asc') searchParams.set('s', '104');
  else if (sort === 'price_desc') searchParams.set('s', '101');
  else if (sort === 'date') searchParams.set('s', '102');

  const queryString = searchParams.toString();
  if (queryString) url += `?${queryString}`;

  console.log(`[Parser] Fetching: ${url}`);
  const html = await fetchWithRetry(url);
  console.log(`[Parser] Got ${html.length} bytes of HTML`);
  await randomDelay();

  const result = parseSearchPage(html, page);
  console.log(`[Parser] Found ${result.listings.length} listings`);

  return result;
}

export async function getListingDetails(avitoId: string): Promise<Listing> {
  const url = `https://www.avito.ru/all/item/${avitoId}`;
  console.log(`[Parser] Fetching listing: ${url}`);
  const html = await fetchWithRetry(url);
  await randomDelay();
  return parseSearchPage(html, 1).listings[0] || ({} as Listing);
}

export async function parseAll(params: {
  query: string;
  city: string;
  maxPages?: number;
}): Promise<Listing[]> {
  const { query, city, maxPages = 3 } = params;
  const allListings: Listing[] = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      const result = await searchListings({ query, city, page });
      allListings.push(...result.listings);
      if (!result.hasMore || page < maxPages) await randomDelay();
      if (!result.hasMore) break;
    } catch (error) {
      if (page > 1) break;
      throw error;
    }
  }

  return allListings;
}
