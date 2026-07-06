import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { Listing, ParseResult, SearchParams } from './types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/109.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

const CITY_URL_MAP: Record<string, string> = {
  'москва': 'moskva',
  'moscow': 'moskva',
  'москва и московская область': 'moskva',
  'санкт-петербург': 'sankt-peterburg',
  'saint petersburg': 'sankt-peterburg',
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
  'крым': 'krym',
  'simferopol': 'simferopol',
};

const CATEGORY_MAP: Record<string, string> = {
  'услуги': 'uslugi',
  'services': 'uslugi',
  'недвижимость': 'nedvizhimost',
  'транспорт': 'transport',
  'работа': 'rabota',
  'электроника': 'elektronika',
  'бытовая техника': 'bytovaya-tekhnika',
  'компьютеры': 'kompyutery',
  'фото и видео': 'foto-i-video',
  'оборудование': 'oborudovanie',
  'ремонт и строительство': 'remont-i-stroitelstvo',
  'одежда обувь аксессуары': 'odezhda-obuv-aksessuary',
  'красота и здоровье': 'krasota-i-zdorove',
  'для дома и дачи': 'dlya-doma-i-dachi',
  'для детей': 'dlya-detey',
  'животные': 'zhivotnye',
  'книги и журналы': 'knigi-i-zhurnaly',
  'спорт и отдых': 'sport-i-otdyh',
  'музыка и видео': 'muzyka-i-video',
  'коллекционирование': 'kollektsionirovanie',
  'другое': 'drugoe',
};

const requestTimestamps: number[] = [];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function normalizeCity(city: string): string {
  const lower = city.toLowerCase().trim();
  return CITY_URL_MAP[lower] || lower;
}

function normalizeCategory(category: string): string {
  const lower = category.toLowerCase().trim();
  return CATEGORY_MAP[lower] || lower;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  const min = 3000;
  const max = 7000;
  return delay(Math.floor(Math.random() * (max - min) + min));
}

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 3600000) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= 100) {
    const oldest = requestTimestamps[0];
    const waitTime = oldest + 3600000 - now;
    console.log(`Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s`);
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
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Attempt ${attempt}/${retries} failed for ${url}:`, error);
      if (attempt < retries) {
        const backoff = attempt * 2000;
        console.log(`Retrying in ${backoff / 1000}s...`);
        await delay(backoff);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

function parsePrice(priceText: string): number {
  const cleaned = priceText.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function extractImages($: cheerio.CheerioAPI, item: cheerio.Cheerio<AnyNode>): string[] {
  const images: string[] = [];
  item.find('img').each((_, el) => {
    const src = $(el).attr('data-src') || $(el).attr('src') || '';
    if (src && !src.includes('svg') && !src.includes('icon')) {
      images.push(src.startsWith('//') ? `https:${src}` : src);
    }
  });
  return images;
}

function parseListingFromSearch($: cheerio.CheerioAPI, item: cheerio.Cheerio<AnyNode>): Listing | null {
  try {
    const linkEl = item.find('a[href*="/"]').first();
    const href = linkEl.attr('href') || '';
    const idMatch = href.match(/\/(\d+)$/);
    const avitoId = idMatch ? idMatch[1] : '';

    if (!avitoId) return null;

    const title = item.find('[itemprop="name"]').text().trim() ||
      item.find('h2, h3, [data-marker="item-title"]').text().trim() || '';

    const priceText = item.find('[itemprop="price"], [data-marker="item-price"]').text().trim() || '0';
    const price = parsePrice(priceText);

    const locationEl = item.find('[itemprop="availableAtOrFrom"], [data-marker="item-location"]');
    const locationText = locationEl.text().trim() || '';
    const locationParts = locationText.split(',').map((s: string) => s.trim());

    const images = extractImages($, item);

    const url = href.startsWith('http') ? href : `https://www.avito.ru${href}`;

    return {
      avito_id: avitoId,
      title,
      description: '',
      price,
      price_formatted: priceText,
      city: locationParts[0] || '',
      district: locationParts[1] || '',
      address: locationText,
      category: '',
      subcategory: '',
      seller_id: '',
      seller_name: '',
      seller_type: 'private',
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
    console.error('Error parsing listing:', error);
    return null;
  }
}

function parseSearchPage(html: string, page: number): ParseResult {
  const $ = cheerio.load(html);
  const listings: Listing[] = [];

  const items = $('[data-marker="item"], .iva-item-content-GQVSe, .snippet-link');

  items.each((_, element) => {
    const listing = parseListingFromSearch($, $(element));
    if (listing) {
      listings.push(listing);
    }
  });

  const totalText = $('[data-marker="search-found-count"]').text().trim() ||
    $('h1').first().text().match(/(\d+)/)?.[1] || '0';
  const total = parseInt(totalText, 10) || 0;

  const hasMore = items.length === 50 || page * 50 < total;

  return {
    listings,
    total,
    page,
    hasMore,
  };
}

async function parseListingPage(html: string): Promise<Listing> {
  const $ = cheerio.load(html);

  const avitoId = $('[data-marker="item-id"]').text().trim() ||
    $('script[type="application/ld+json"]').text().match(/"identifier"\s*:\s*"(\d+)"/)?.[1] || '';

  const title = $('[data-marker="item-title"], h1').first().text().trim() || '';

  const description = $('[data-marker="item-description"], .item-description-text').text().trim() || '';

  const priceText = $('[data-marker="item-price"], .item-price').text().trim() || '0';
  const price = parsePrice(priceText);

  const locationEl = $('[data-marker="item-address"], .item-address__string');
  const addressText = locationEl.text().trim() || '';
  const locationParts = addressText.split(',').map((s: string) => s.trim());

  const images: string[] = [];
  $('[data-marker="slider-image-container"] img, .gallery-overlay-frame img').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src) {
      images.push(src.startsWith('//') ? `https:${src}` : src);
    }
  });

  const sellerName = $('[data-marker="seller-link"], .seller-link').text().trim() || '';
  const sellerType: 'private' | 'business' =
    $('.seller-type-label').text().includes('Бизнес') || $('[data-marker="seller-link"] .business') ? 'business' : 'private';

  const viewsText = $('[data-marker="item views"]').text().trim() || '0';
  const viewsEstimate = parseInt(viewsText, 10) || 0;

  const favoritesText = $('[data-marker="item-favorite-count"]').text().trim() || '0';
  const favoritesCount = parseInt(favoritesText, 10) || 0;

  const categoryEl = $('[data-marker="breadcrumbs"] li a, .breadcrumbs-link');
  const categories: string[] = [];
  categoryEl.each((_, el) => {
    const text = $(el).text().trim();
    if (text) categories.push(text);
  });

  const url = $('link[rel="canonical"]').attr('href') || '';

  return {
    avito_id: avitoId,
    title,
    description,
    price,
    price_formatted: priceText,
    city: locationParts[0] || '',
    district: locationParts[1] || '',
    address: addressText,
    category: categories[0] || '',
    subcategory: categories[1] || '',
    seller_id: '',
    seller_name: sellerName,
    seller_type: sellerType,
    url,
    images,
    image_count: images.length,
    date_created: $('[data-marker="item-date"]').text().trim() || new Date().toISOString(),
    date_parsed: new Date().toISOString(),
    date_updated: new Date().toISOString(),
    status: 'active',
    text_quality_score: 0,
    uniqueness_score: 0,
    image_quality_score: 0,
    overall_score: 0,
    views_estimate: viewsEstimate,
    favorites_count: favoritesCount,
    response_time: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function searchListings(params: SearchParams): Promise<ParseResult> {
  const { query, city, category, priceMin, priceMax, page = 1, sort } = params;

  const citySlug = city ? normalizeCity(city) : '';
  const categorySlug = category ? normalizeCategory(category) : '';

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

  console.log(`Fetching: ${url}`);
  const html = await fetchWithRetry(url);
  await randomDelay();

  return parseSearchPage(html, page);
}

export async function getListingDetails(avitoId: string): Promise<Listing> {
  const url = `https://www.avito.ru/all/item/${avitoId}`;
  console.log(`Fetching listing: ${url}`);
  const html = await fetchWithRetry(url);
  await randomDelay();

  return parseListingPage(html);
}

export async function parseAll(params: {
  query: string;
  city: string;
  maxPages?: number;
}): Promise<Listing[]> {
  const { query, city, maxPages = 5 } = params;
  const allListings: Listing[] = [];

  for (let page = 1; page <= maxPages; page++) {
    console.log(`Parsing page ${page}/${maxPages}...`);
    try {
      const result = await searchListings({
        query,
        city,
        page,
      });

      allListings.push(...result.listings);

      if (!result.hasMore) {
        console.log(`No more pages after page ${page}`);
        break;
      }

      if (page < maxPages) {
        await randomDelay();
      }
    } catch (error) {
      console.error(`Error parsing page ${page}:`, error);
      if (page > 1) break;
      throw error;
    }
  }

  console.log(`Total parsed: ${allListings.length} listings`);
  return allListings;
}
