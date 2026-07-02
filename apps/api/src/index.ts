import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { TravelApiService } from './services/travelApiService'
import { DatabaseService } from './services/databaseService'

// Define environment bindings
type Bindings = {
  DB: D1Database
  AMADEUS_API_KEY: string
  AMADEUS_API_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend
app.use('/*', cors())

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Travel Deals API',
    version: '1.0.0',
    status: 'healthy',
    dataSource: c.env.DB ? 'database' : 'mock',
  })
})

// Get all deals with optional filters
app.get('/api/deals', async (c) => {
  try {
    const { destination, origin, minPrice, maxPrice, dealType, providerType, page, pageSize } =
      c.req.query()

    const filters = {
      destination,
      origin,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      dealType: dealType as any,
      providerType: providerType as any,
    }

    const pageNum = page ? Number(page) : 1
    const pageSizeNum = pageSize ? Number(pageSize) : 20

    // Use database if available, otherwise fall back to mock data
    let response
    if (c.env.DB) {
      const dbService = new DatabaseService(c.env.DB)
      response = await dbService.getDeals(filters, pageNum, pageSizeNum)
    } else {
      const mockService = new TravelApiService(c.env.AMADEUS_API_KEY, c.env.AMADEUS_API_SECRET)
      response = await mockService.getDeals(filters, pageNum, pageSizeNum)
    }

    return c.json(response)
  } catch (error) {
    console.error('Error fetching deals:', error)
    return c.json({ error: 'Failed to fetch deals' }, 500)
  }
})

// Get a single deal by ID
app.get('/api/deals/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Use database if available, otherwise fall back to mock data
    let deal
    if (c.env.DB) {
      const dbService = new DatabaseService(c.env.DB)
      deal = await dbService.getDealById(id)
    } else {
      const mockService = new TravelApiService(c.env.AMADEUS_API_KEY, c.env.AMADEUS_API_SECRET)
      deal = await mockService.getDealById(id)
    }

    if (!deal) {
      return c.json({ error: 'Deal not found' }, 404)
    }

    return c.json(deal)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return c.json({ error: 'Failed to fetch deal' }, 500)
  }
})

export default app
