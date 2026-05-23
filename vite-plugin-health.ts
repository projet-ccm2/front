import type { Plugin } from 'vite'

export function healthCheckPlugin(): Plugin {
  return {
    name: 'health-check',
    configureServer(server) {
      server.middlewares.use('/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }))
      })
      server.middlewares.use('/env-config.js', (_req, res, next) => {
        res.setHeader('Cache-Control', 'no-store')
        next()
      })
    },
  }
}
