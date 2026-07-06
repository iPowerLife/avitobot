export interface Listing {
  id?: number;
  avito_id: string;
  title: string;
  description: string;
  price: number;
  price_formatted: string;
  city: string;
  district: string;
  address: string;
  category: string;
  subcategory: string;
  seller_id: string;
  seller_name: string;
  seller_type: 'private' | 'business';
  seller_url: string;
  seller_rating: number;
  seller_reviews_count: number;
  url: string;
  images: string[];
  image_count: number;
  views_count: number;
  date_created: string;
  date_parsed: string;
  date_updated: string;
  status: 'active' | 'expired' | 'deleted';
  text_quality_score: number;
  uniqueness_score: number;
  image_quality_score: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id?: number;
  listing_id: number;
  price: number;
  recorded_at: string;
}

export interface SearchQuery {
  id?: number;
  query: string;
  city: string;
  category: string;
  results_count: number;
  executed_at: string;
}

export interface SearchParams {
  query: string;
  city?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  sort?: 'date' | 'price_asc' | 'price_desc';
  maxPages?: number;
}

export interface ParseResult {
  listings: Listing[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface AnalysisResult {
  text_quality_score: number;
  uniqueness_score: number;
  image_quality_score: number;
  overall_score: number;
  word_count: number;
  has_structure: boolean;
  keywords: string[];
}

export interface StatsResult {
  avg_price: number;
  min_price: number;
  max_price: number;
  median_price: number;
  total_listings: number;
  trend: 'up' | 'down' | 'stable';
  price_history: { date: string; price: number }[];
}
