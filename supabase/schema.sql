-- AvitoBot Database Schema

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id BIGSERIAL PRIMARY KEY,
  avito_id VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  price_formatted VARCHAR(50),
  city VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  seller_id VARCHAR(50),
  seller_name VARCHAR(200),
  seller_type VARCHAR(20) DEFAULT 'private',
  seller_url TEXT,
  seller_rating FLOAT DEFAULT 0,
  seller_reviews_count INTEGER DEFAULT 0,
  url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  image_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  date_created TEXT,
  date_parsed TIMESTAMP DEFAULT NOW(),
  date_updated TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  text_quality_score FLOAT DEFAULT 0,
  uniqueness_score FLOAT DEFAULT 0,
  image_quality_score FLOAT DEFAULT 0,
  overall_score FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Search queries log
CREATE TABLE IF NOT EXISTS search_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  city VARCHAR(100),
  category VARCHAR(100),
  results_count INTEGER DEFAULT 0,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_date_parsed ON listings(date_parsed);
CREATE INDEX IF NOT EXISTS idx_listings_overall_score ON listings(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_listings_avito_id ON listings(avito_id);
CREATE INDEX IF NOT EXISTS idx_price_history_listing ON price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_executed ON search_queries(executed_at);
