# Database Migrations

This directory contains SQL migration files for the Cloudflare D1 database.

## Migration Files

Migrations are numbered sequentially and should be applied in order:

1. **0001_create_travel_deals.sql** - Creates the main `travel_deals` table with indexes
2. **0002_seed_travel_deals.sql** - Seeds initial sample data (3 travel deals)

## Running Migrations

### Local Development

```bash
# Create a local D1 database
wrangler d1 create travel-deals-db

# Apply migrations
wrangler d1 execute travel-deals-db --local --file=./migrations/0001_create_travel_deals.sql
wrangler d1 execute travel-deals-db --local --file=./migrations/0002_seed_travel_deals.sql
```

### Production

```bash
# Apply migrations to production database
wrangler d1 execute travel-deals-db --file=./migrations/0001_create_travel_deals.sql
wrangler d1 execute travel-deals-db --file=./migrations/0002_seed_travel_deals.sql
```

## Database Schema

### `travel_deals` Table

| Column | Type | Constraints | Description |
|:-------|:-----|:------------|:------------|
| `id` | TEXT | PRIMARY KEY | Unique deal identifier |
| `title` | TEXT | NOT NULL | Deal title/name |
| `destination` | TEXT | NOT NULL | Destination city/country |
| `origin` | TEXT | NOT NULL | Origin city/country |
| `price` | REAL | NOT NULL | Current deal price |
| `original_price` | REAL | | Original price before discount |
| `currency` | TEXT | NOT NULL, DEFAULT 'USD' | Currency code |
| `travel_start_date` | TEXT | NOT NULL | Travel start date (ISO 8601) |
| `travel_end_date` | TEXT | NOT NULL | Travel end date (ISO 8601) |
| `booking_deadline` | TEXT | NOT NULL | Last date to book (ISO 8601) |
| `deal_type` | TEXT | NOT NULL, CHECK | Type: flight, hotel, package, cruise, all-inclusive |
| `provider` | TEXT | NOT NULL | Provider name (e.g., Expedia) |
| `provider_type` | TEXT | NOT NULL, CHECK | Type: airline, hotel, ota, cruise-line, tour-operator |
| `quality_score` | INTEGER | NOT NULL, CHECK (0-100) | Quality rating 0-100 |
| `inclusions` | TEXT | NOT NULL | JSON array of included items |
| `restrictions` | TEXT | | JSON array of restrictions |
| `url` | TEXT | NOT NULL | Link to deal booking page |
| `image_url` | TEXT | | Deal image URL |
| `created_at` | TEXT | NOT NULL, DEFAULT now() | Record creation timestamp |
| `updated_at` | TEXT | NOT NULL, DEFAULT now() | Record update timestamp |

### Indexes

- `idx_deals_destination` - Optimize destination searches
- `idx_deals_origin` - Optimize origin searches
- `idx_deals_price` - Optimize price filtering
- `idx_deals_deal_type` - Optimize deal type filtering
- `idx_deals_booking_deadline` - Optimize urgency queries
- `idx_deals_created_at` - Optimize sorting by date

## Notes

- Dates are stored as TEXT in ISO 8601 format (YYYY-MM-DD)
- JSON arrays (inclusions, restrictions) are stored as TEXT
- All timestamps use UTC
- SQLite/D1 uses CHECK constraints for enum-like validation
