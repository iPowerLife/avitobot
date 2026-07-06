-- Avito Parser Database Schema

-- Listings table
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  avito_id VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  price_formatted VARCHAR(50),
  city VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  seller_id VARCHAR(50),
  seller_name VARCHAR(200),
  seller_type VARCHAR(20) DEFAULT 'private',
  url TEXT NOT NULL,
  images TEXT[],
  image_count INTEGER DEFAULT 0,
  date_created TIMESTAMP,
  date_parsed TIMESTAMP DEFAULT NOW(),
  date_updated TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  text_quality_score FLOAT,
  uniqueness_score FLOAT,
  image_quality_score FLOAT,
  overall_score FLOAT,
  views_estimate INTEGER,
  favorites_count INTEGER,
  response_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price history table
CREATE TABLE price_history (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id),
  price INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Search queries table
CREATE TABLE search_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  city VARCHAR(100),
  category VARCHAR(100),
  results_count INTEGER,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_date_parsed ON listings(date_parsed);
CREATE INDEX idx_price_history_listing_id ON price_history(listing_id);
