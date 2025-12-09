-- Migration: Seed initial travel deals data
-- Created: 2025-12-09

INSERT INTO travel_deals (
  id, title, destination, origin, price, original_price, currency,
  travel_start_date, travel_end_date, booking_deadline,
  deal_type, provider, provider_type, quality_score,
  inclusions, restrictions, url, image_url
) VALUES
(
  '1',
  'Cancun All-Inclusive Paradise',
  'Cancun, Mexico',
  'New York, NY',
  899,
  1299,
  'USD',
  '2025-03-15',
  '2025-03-22',
  '2025-02-15',
  'all-inclusive',
  'Expedia',
  'ota',
  95,
  '["Flights", "Hotel", "All Meals", "Drinks", "Airport Transfer"]',
  '["Non-refundable", "Minimum 2 adults"]',
  'https://example.com/deal/1',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21'
),
(
  '2',
  'Paris City Break',
  'Paris, France',
  'London, UK',
  1299,
  1799,
  'USD',
  '2025-04-01',
  '2025-04-05',
  '2025-03-01',
  'package',
  'Booking.com',
  'ota',
  92,
  '["Flights", "Hotel", "Breakfast", "City Tour"]',
  NULL,
  'https://example.com/deal/2',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
),
(
  '3',
  'Tokyo Adventure Package',
  'Tokyo, Japan',
  'Los Angeles, CA',
  1899,
  2599,
  'USD',
  '2025-05-10',
  '2025-05-20',
  '2025-04-10',
  'package',
  'Japan Airlines',
  'airline',
  98,
  '["Flights", "Hotel", "JR Pass", "Airport Transfer"]',
  NULL,
  'https://example.com/deal/3',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
);
