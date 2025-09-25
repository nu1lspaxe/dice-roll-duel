import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Serve static files from dist/public
app.get('/*', serveStatic({ root: './' }))

// Add your API routes here
app.post('/api/roll', async (c) => {
  // Handle dice roll logic
  return c.json({ success: true })
})

export default app