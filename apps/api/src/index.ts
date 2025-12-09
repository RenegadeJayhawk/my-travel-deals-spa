import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { TravelApiService } from './services/travelApiService'

const app = new Hono()

// Enable CORS for frontend
app.use('/*', cors())

// Initialize services
const travelService = new TravelApiService()

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Travel Deals API',
    version: '1.0.0',
    status: 'healthy',
  })
})

// Get all deals with optional filters
app.get('/api/deals', async (c) => {
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

  const response = await travelService.getDeals(filters, pageNum, pageSizeNum)

  return c.json(response)
})

// Get a single deal by ID
app.get('/api/deals/:id', async (c) => {
  const id = c.req.param('id')
  const deal = await travelService.getDealById(id)

  if (!deal) {
    return c.json({ error: 'Deal not found' }, 404)
  }

  return c.json(deal)
})

export default app
