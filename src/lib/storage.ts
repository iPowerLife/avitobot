// Client-side storage for listings when Supabase is not configured
import { Listing } from './types';

const STORAGE_KEY = 'avitobot_listings';
const MAX_STORED = 500;

export function saveListings(listings: Listing[]): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getListings();
    const merged = [...listings, ...existing];
    // Deduplicate by avito_id
    const seen = new Set<string>();
    const unique = merged.filter((l) => {
      if (seen.has(l.avito_id)) return false;
      seen.add(l.avito_id);
      return true;
    }).slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function getListings(): Listing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getListingById(id: string | number): Listing | null {
  const listings = getListings();
  return listings.find((l) => l.id?.toString() === id.toString() || l.avito_id === id.toString()) || null;
}

export function deleteListing(id: number): void {
  const listings = getListings().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

export function deleteAllListings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStats() {
  const listings = getListings().filter((l) => l.price > 0);
  if (listings.length === 0) {
    return { avg_price: 0, min_price: 0, max_price: 0, median_price: 0, total_listings: 0, trend: 'stable' as const, price_history: [] };
  }

  const prices = listings.map((l) => l.price);
  const avg_price = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const sorted = [...prices].sort((a, b) => a - b);
  const median_price = sorted.length % 2 !== 0
    ? sorted[Math.floor(sorted.length / 2)]
    : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);

  // Group by date for price history
  const byDate: Record<string, number[]> = {};
  listings.forEach((l) => {
    const d = l.date_parsed?.split('T')[0] || new Date().toISOString().split('T')[0];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(l.price);
  });

  const price_history = Object.entries(byDate)
    .map(([date, p]) => ({ date, price: Math.round(p.reduce((a, b) => a + b, 0) / p.length) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Simple trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (price_history.length >= 2) {
    const recent = price_history.slice(-3);
    const older = price_history.slice(-6, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b.price, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b.price, 0) / older.length;
      const diff = (recentAvg - olderAvg) / olderAvg;
      if (diff > 0.05) trend = 'up';
      else if (diff < -0.05) trend = 'down';
    }
  }

  return {
    avg_price,
    min_price: Math.min(...prices),
    max_price: Math.max(...prices),
    median_price,
    total_listings: listings.length,
    trend,
    price_history,
  };
}
