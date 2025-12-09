-- Migration: Create travel_deals table
-- Created: 2025-12-09

CREATE TABLE IF NOT EXISTS travel_deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  travel_start_date TEXT NOT NULL,
  travel_end_date TEXT NOT NULL,
  booking_deadline TEXT NOT NULL,
  deal_type TEXT NOT NULL CHECK(deal_type IN ('flight', 'hotel', 'package', 'cruise', 'all-inclusive')),
  provider TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK(provider_type IN ('airline', 'hotel', 'ota', 'cruise-line', 'tour-operator')),
  quality_score INTEGER NOT NULL CHECK(quality_score >= 0 AND quality_score <= 100),
  inclusions TEXT NOT NULL, -- JSON array stored as TEXT
  restrictions TEXT, -- JSON array stored as TEXT
  url TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deals_destination ON travel_deals(destination);
CREATE INDEX IF NOT EXISTS idx_deals_origin ON travel_deals(origin);
CREATE INDEX IF NOT EXISTS idx_deals_price ON travel_deals(price);
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON travel_deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_booking_deadline ON travel_deals(booking_deadline);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON travel_deals(created_at);
