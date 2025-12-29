# D1 Database Setup Instructions

**Status:** ⏸️ Pending Manual Setup  
**Date:** December 9, 2025

---

## 📋 Overview

The D1 database schema and migrations have been created and are ready to use. However, due to authentication limitations in the development environment, the database needs to be created manually through the Cloudflare Dashboard.

**Good News:** The application is designed to work seamlessly with both mock data and the real database, so you can continue development while the database setup is pending.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create the Database

1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages** in the left sidebar
3. Select **D1** from the submenu
4. Click **"Create database"**
5. Enter name: `travel-deals-db`
6. Click **"Create"**
7. **Copy the Database ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 2: Update Configuration

Open `apps/api/wrangler.toml` and update line 9:

```toml
database_id = "YOUR_DATABASE_ID_HERE"
```

Replace `YOUR_DATABASE_ID_HERE` with the ID from Step 1.

### Step 3: Run Migrations

```bash
cd apps/api

# Run the schema migration
wrangler d1 execute travel-deals-db --file=./migrations/0001_create_travel_deals.sql

# Run the seed data migration
wrangler d1 execute travel-deals-db --file=./migrations/0002_seed_travel_deals.sql
```

### Step 4: Test the Database

```bash
# Start the API locally
pnpm --filter api dev

# Test the endpoint
curl http://localhost:8787/api/deals
```

You should see 3 travel deals returned from the database!

---

## 📁 What's Already Been Created

### ✅ Database Schema (`0001_create_travel_deals.sql`)

- Complete `travel_deals` table with 19 columns
- Proper constraints and data types
- 6 performance indexes
- JSON storage for arrays

### ✅ Seed Data (`0002_seed_travel_deals.sql`)

- 3 sample travel deals:
  1. Cancun All-Inclusive Paradise - $899
  2. Paris City Break - $1299
  3. Tokyo Adventure Package - $1899

### ✅ Database Service Layer (`databaseService.ts`)

- Full CRUD operations
- OWASP-compliant parameterized queries
- Filtering and pagination support
- Comprehensive error handling

### ✅ API Integration (`index.ts`)

- Automatic detection of database availability
- Seamless fallback to mock data
- Identical interface for both data sources

---

## 🔄 Current Behavior (Without Database)

**The application works perfectly with mock data:**

- ✅ API endpoints return mock travel deals
- ✅ Filtering and pagination work correctly
- ✅ Frontend can integrate and display deals
- ✅ Development can continue uninterrupted

**Health check shows data source:**
```bash
curl http://localhost:8787/
# Returns: {"dataSource": "mock"}
```

**After database setup:**
```bash
curl http://localhost:8787/
# Returns: {"dataSource": "database"}
```

---

## 🧪 Testing the Migrations Locally

You can test the migrations locally before running them in production:

```bash
# Create a local D1 database for testing
wrangler d1 create travel-deals-db-local

# Run migrations locally
wrangler d1 execute travel-deals-db-local --local --file=./migrations/0001_create_travel_deals.sql
wrangler d1 execute travel-deals-db-local --local --file=./migrations/0002_seed_travel_deals.sql

# Query the local database
wrangler d1 execute travel-deals-db-local --local --command="SELECT * FROM travel_deals"
```

---

## 📊 Database Schema Reference

### `travel_deals` Table

| Column | Type | Description |
|:-------|:-----|:------------|
| `id` | TEXT | Primary key |
| `title` | TEXT | Deal title |
| `destination` | TEXT | Destination city/country |
| `origin` | TEXT | Origin city/country |
| `price` | REAL | Current price |
| `original_price` | REAL | Original price (optional) |
| `currency` | TEXT | Currency code (default: USD) |
| `travel_start_date` | TEXT | Start date (ISO 8601) |
| `travel_end_date` | TEXT | End date (ISO 8601) |
| `booking_deadline` | TEXT | Deadline to book (ISO 8601) |
| `deal_type` | TEXT | Type: flight, hotel, package, cruise, all-inclusive |
| `provider` | TEXT | Provider name |
| `provider_type` | TEXT | Type: airline, hotel, ota, cruise-line, tour-operator |
| `quality_score` | INTEGER | Quality rating (0-100) |
| `inclusions` | TEXT | JSON array of included items |
| `restrictions` | TEXT | JSON array of restrictions (optional) |
| `url` | TEXT | Booking URL |
| `image_url` | TEXT | Deal image URL (optional) |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Update timestamp |

---

## 🔒 Security Notes

All database operations use **parameterized queries** to prevent SQL injection (OWASP A03 compliance).

Example from `databaseService.ts`:
```typescript
await this.db
  .prepare('SELECT * FROM travel_deals WHERE id = ?')
  .bind(id)
  .first()
```

---

## 💡 Next Steps After Database Setup

Once the database is configured:

1. ✅ Verify the API returns database data
2. ✅ Test filtering and pagination
3. ✅ Commit the updated `wrangler.toml` with database ID
4. ✅ Continue with Milestone 2: Frontend Deals Listing

---

## ❓ Troubleshooting

### Issue: "Database not found"
- Verify the database ID in `wrangler.toml` is correct
- Ensure migrations have been run

### Issue: "Authentication failed"
- Run `wrangler login` to re-authenticate
- Verify you have D1 permissions in your Cloudflare account

### Issue: "Migration failed"
- Check the SQL syntax in migration files
- Ensure you're running migrations in order (0001, then 0002)

---

## 📞 Need Help?

- **Cloudflare D1 Documentation**: https://developers.cloudflare.com/d1/
- **Wrangler CLI Documentation**: https://developers.cloudflare.com/workers/wrangler/
- **Project Repository**: https://github.com/RenegadeJayhawk/my-travel-deals-spa

---

**The database setup is optional for now. The application will continue to work with mock data until you're ready to set up the real database!** 🎉
