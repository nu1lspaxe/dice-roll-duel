import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'
import { storage } from './storage'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Serve static files from dist/public
app.get('/*', serveStatic({
  root: './',
  manifest: {
    "index.html": {
      "contentType": "text/html;charset=utf-8",
      "filename": "index.html"
    }
  }
}))

// Game endpoints
app.post('/api/games', async (c) => {
  // 建立新遊戲
  const body = await c.req.json()
  // TODO: 實作建立遊戲邏輯
  return c.json({ gameId: 'new-game' })
})

app.get('/api/games/:id', async (c) => {
  const gameId = c.req.param('id')
  // TODO: 實作獲取遊戲狀態邏輯
  return c.json({ gameId, state: 'active' })
})

app.post('/api/roll', async (c) => {
  const body = await c.req.json()
  // TODO: 實作骰子邏輯
  return c.json({ 
    success: true,
    roll: Math.floor(Math.random() * 6) + 1 
  })
})

export default {
  fetch: app.fetch
}