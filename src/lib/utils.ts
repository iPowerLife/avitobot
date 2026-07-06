// Format price from kopecks to readable string
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price / 100) + ' ₽';
}

// Parse price string to kopecks
export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) * 100 || 0;
}

// Get city URL slug
export function getCitySlug(city: string): string {
  const cityMap: Record<string, string> = {
    'москва': 'moskva',
    'санкт-петербург': 'sankt-peterburg',
    'новосибирск': 'novosibirsk',
    'екатеринбург': 'ekaterinburg',
    'казань': 'kazan',
    'нижний новгород': 'nizhniy_novgorod',
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
  return cityMap[city.toLowerCase()] || city.toLowerCase().replace(/\s+/g, '_');
}

// Delay function
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Random delay between min and max ms
export function randomDelay(min: number = 3000, max: number = 7000): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Calculate median
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 
    ? sorted[middle] 
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

// Calculate trend
export function calculateTrend(prices: { date: string; price: number }[]): 'up' | 'down' | 'stable' {
  if (prices.length < 2) return 'stable';
  
  const recent = prices.slice(-7);
  const older = prices.slice(-14, -7);
  
  if (older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((a, b) => a + b.price, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b.price, 0) / older.length;
  
  const diff = (recentAvg - olderAvg) / olderAvg;
  
  if (diff > 0.05) return 'up';
  if (diff < -0.05) return 'down';
  return 'stable';
}
