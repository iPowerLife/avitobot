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
  'электроника': 'elektronика',
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt < retries) await delay(attempt * 2000);
      else throw error;
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
  const seen = new Set<string>();
  
  // Helper to add image if valid
  const addImage = (src: string) => {
    if (!src || seen.has(src)) return;
    // Skip SVGs and icons
    if (src.includes('svg') || src.includes('icon')) return;
    // Only include Avito CDN images or lazy-loaded images
    if (src.includes('avito.st') || src.includes('data-src')) {
      const url = src.startsWith('//') ? `https:${src}` : src;
      seen.add(url);
      images.push(url);
    }
  };

  // 1. Standard selectors
  item.find('img[itemProp="image"], img[data-marker="item-photo/img"]').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    addImage(src);
  });

  // 2. Lazy loaded images with data-src
  item.find('img[data-src]').each((_, el) => {
    const src = $(el).attr('data-src') || '';
    addImage(src);
  });

  // 3. Any Avito CDN images (src containing avito.st)
  item.find('img[src*="avito.st"]').each((_, el) => {
    const src = $(el).attr('src') || '';
    addImage(src);
  });

  // 4. Specific image CDN (img.avito.st)
  item.find('img[src*="img.avito.st"]').each((_, el) => {
    const src = $(el).attr('src') || '';
    addImage(src);
  });

  // 5. Images inside slider elements
  item.find('li[data-marker*="slider-image"] img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    addImage(src);
  });

  // 6. Fallback: any img with valid src within the card
  if (images.length === 0) {
    item.find('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src && src.startsWith('http')) {
        addImage(src);
      }
    });
  }

  return images;
}

function extractSellerInfo($: cheerio.CheerioAPI, item: cheerio.Cheerio<AnyNode>) {
  // Seller name and profile URL
  const sellerLink = item.find('a[data-marker="item-link"]');
  const sellerName = sellerLink.text().trim() || '';
  const sellerHref = sellerLink.attr('href') || '';
  const sellerUrl = sellerHref ? `https://www.avito.ru${sellerHref}` : '';

  // Extract seller ID from URL pattern /i{NUMBER}
  const sellerIdMatch = sellerHref.match(/\/i(\d+)/);
  const sellerId = sellerIdMatch ? sellerIdMatch[1] : '';

  // Seller rating
  const ratingText = item.find('[data-marker="seller-rating/score"]').text().trim();
  const sellerRating = ratingText ? parseFloat(ratingText.replace(',', '.')) : 0;

  // Reviews count
  const reviewsText = item.find('[data-marker="seller-rating/reviews"]').text().trim();
  const reviewsMatch = reviewsText.match(/(\d+)/);
  const sellerReviewsCount = reviewsMatch ? parseInt(reviewsMatch[1], 10) : 0;

  return { sellerName, sellerUrl, sellerId, sellerRating, sellerReviewsCount };
}

function parseListingFromSearch($: cheerio.CheerioAPI, item: cheerio.Cheerio<AnyNode>): Listing | null {
  try {
    const avitoId = item.attr('data-item-id') || '';
    if (!avitoId) return null;

    // Title
    const titleEl = item.find('a[data-marker="item-title"]');
    const title = titleEl.attr('title') || titleEl.text().trim() || '';
    if (!title) return null;

    // URL
    const href = titleEl.attr('href') || '';
    const url = href.startsWith('http') ? href : `https://www.avito.ru${href.split('?')[0]}`;

    // Price
    const priceEl = item.find('[itemProp="price"]');
    const priceContent = priceEl.attr('content') || '';
    const priceText = priceContent || item.find('[data-marker="item-price"]').text().trim() || '0';
    // priceContent is in kopecks (integer), so divide by 100 to get rubles
    const priceKopecks = parseInt(priceContent, 10);
    const price = priceKopecks ? Math.round(priceKopecks / 100) : parsePrice(priceText);

    // Description snippet (first paragraph in the card)
    const descEl = item.find('p').filter((_, el) => {
      const text = $(el).text();
      return text.length > 20 && !text.includes('Продвинуто') && !text.includes('Загрузка');
    }).first();
    const description = descEl.text().trim() || '';

    // Location
    const locationEl = item.find('[data-marker="item-address"]');
    const locationText = locationEl.text().trim() || '';
    const locationParts = locationText.split(',').map((s: string) => s.trim());

    // Images
    const images = extractImages($, item);

    // Date info
    const dateEl = item.find('[data-marker="item-date"], time');
    const dateText = dateEl.text().trim() || '';
    const dateAttr = dateEl.attr('datetime') || '';

    // Views count - try multiple selectors and text patterns
    let viewsCount = 0;

    // 1. Try direct data-marker selector
    const viewsEl = item.find('[data-marker="item-views"]');
    if (viewsEl.length) {
      const viewsText = viewsEl.text().trim();
      const viewsMatch = viewsText.match(/(\d+)/);
      if (viewsMatch) viewsCount = parseInt(viewsMatch[1], 10);
    }

    // 2. Try data-marker containing 'view'
    if (viewsCount === 0) {
      const viewsEl2 = item.find('[data-marker*="view"]');
      if (viewsEl2.length) {
        const viewsText = viewsEl2.text().trim();
        const viewsMatch = viewsText.match(/(\d+)/);
        if (viewsMatch) viewsCount = parseInt(viewsMatch[1], 10);
      }
    }

    // 3. Try text containing 'просмотр' or 'просм'
    if (viewsCount === 0) {
      const fullText = item.text();
      const viewsMatch = fullText.match(/(\d+)\s*(?:просмотр|просм)/i);
      if (viewsMatch) viewsCount = parseInt(viewsMatch[1], 10);
    }

    // Seller info
    const seller = extractSellerInfo($, item);

    // Determine seller type
    const sellerTypeEl = item.find('[data-marker="business-label"], [data-marker="seller-label"]');
    const sellerTypeText = sellerTypeEl.text().trim();
    const sellerType: 'private' | 'business' =
      sellerTypeText.includes('Бизнес') || sellerTypeText.includes('ООО') || sellerTypeText.includes('ИП')
        ? 'business' : 'private';

    return {
      avito_id: avitoId,
      title,
      description,
      price: price || 0,
      price_formatted: price ? `${new Intl.NumberFormat('ru-RU').format(price)} ₽` : 'Договорная',
      city: locationParts[0] || '',
      district: locationParts[1] || '',
      address: locationText,
      category: '',
      subcategory: '',
      seller_id: seller.sellerId,
      seller_name: seller.sellerName,
      seller_type: sellerType,
      seller_url: seller.sellerUrl,
      seller_rating: seller.sellerRating,
      seller_reviews_count: seller.sellerReviewsCount,
      url,
      images,
      image_count: images.length,
      views_count: viewsCount,
      date_created: dateAttr || dateText || new Date().toISOString(),
      date_parsed: new Date().toISOString(),
      date_updated: new Date().toISOString(),
      status: 'active',
      text_quality_score: 0,
      uniqueness_score: 0,
      image_quality_score: 0,
      overall_score: 0,
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

  const items = $('div[data-marker="item"]');

  items.each((_, element) => {
    const listing = parseListingFromSearch($, $(element));
    if (listing) {
      listings.push(listing);
    }
  });

  const totalText = $('[data-marker="search-found-count"]').text().trim() ||
    $('h1').first().text().match(/(\d+)/)?.[1] || '0';
  const total = parseInt(totalText, 10) || listings.length;

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
  const { query, city, category, priceMin, priceMax, page = 1, sort, maxPages } = params;

  const citySlug = city ? normalizeCity(city) : '';
  const categorySlug = category ? normalizeCategory(category) : 'uslugi';

  // If maxPages is specified, fetch multiple pages
  if (maxPages && maxPages > 1) {
    const allListings: Listing[] = [];
    let lastResult: ParseResult | null = null;
    let totalFromFirstPage = 0;

    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
      try {
        // Build URL for current page
        let pageUrl = 'https://www.avito.ru';
        if (citySlug) pageUrl += `/${citySlug}`;
        if (categorySlug) pageUrl += `/${categorySlug}`;

        const searchParams = new URLSearchParams();
        if (query) searchParams.set('q', query);
        if (currentPage > 1) searchParams.set('p', currentPage.toString());
        if (priceMin) searchParams.set('priceMin', priceMin.toString());
        if (priceMax) searchParams.set('priceMax', priceMax.toString());
        if (sort === 'price_asc') searchParams.set('s', '104');
        else if (sort === 'price_desc') searchParams.set('s', '101');
        else if (sort === 'date') searchParams.set('s', '102');

        const queryString = searchParams.toString();
        if (queryString) pageUrl += `?${queryString}`;

        console.log(`[Parser] Fetching page ${currentPage}: ${pageUrl}`);
        const html = await fetchWithRetry(pageUrl);
        console.log(`[Parser] Got ${html.length} bytes for page ${currentPage}`);
        await randomDelay();

        const result = parseSearchPage(html, currentPage);
        allListings.push(...result.listings);

        if (currentPage === 1) {
          totalFromFirstPage = result.total;
        }

        console.log(`[Parser] Found ${result.listings.length} listings on page ${currentPage}`);

        // Stop if no more pages
        if (!result.hasMore) {
          lastResult = result;
          break;
        }

        lastResult = result;
      } catch (error) {
        if (currentPage > 1) break;
        throw error;
      }
    }

    return {
      listings: allListings,
      total: totalFromFirstPage || allListings.length,
      page: maxPages,
      hasMore: lastResult ? lastResult.hasMore : false,
    };
  }

  // Single page fetch (original behavior)
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
  console.log(`[Parser] Got ${html.length} bytes`);
  await randomDelay();

  const result = parseSearchPage(html, page);
  console.log(`[Parser] Found ${result.listings.length} listings`);

  return result;
}

export async function getListingDetails(avitoId: string): Promise<Listing> {
  const url = `https://www.avito.ru/all/item/${avitoId}`;
  const html = await fetchWithRetry(url);
  await randomDelay();
  const result = parseSearchPage(html, 1);
  return result.listings[0] || ({} as Listing);
}

export async function parseAll(params: {
  query: string;
  city: string;
  maxPages?: number;
}): Promise<Listing[]> {
  const { query, city, maxPages = 3 } = params;
  const result = await searchListings({ query, city, maxPages });
  return result.listings;
}
