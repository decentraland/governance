import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handle from 'decentraland-gatsby/dist/entities/Route/handle'
import express, { Express, Router } from 'express'

/**
 * Mounts a single route module the way server.ts does — under /api, with the same
 * not-found fallback — so route tests exercise real path matching, middleware order and the
 * RequestError to status-code mapping done by handleAPI.
 *
 * The auth-chain verification itself is not exercised: tests that need an authenticated caller
 * mock decentraland-gatsby's auth middleware, so what is covered is whether a route requires
 * auth and what it does with the resulting address, not the signature checking behind it.
 */
export function createTestApp(router: Router): Express {
  const app = express()
  app.set('x-powered-by', false)
  app.use(express.json())
  app.use('/api', [
    router,
    handle(async () => {
      throw new RequestError('NotFound', RequestError.NotFound)
    }),
  ])
  return app
}

/**
 * Captures the raw request body under /api/webhooks exactly as server.ts does, so signature
 * tests cover the rawBody path rather than only the JSON.stringify fallback.
 */
export function createWebhookTestApp(router: Router): Express {
  const app = express()
  app.set('x-powered-by', false)
  app.use(
    '/api/webhooks',
    express.json({
      verify: (req, _res, buf) => {
        ;(req as unknown as { rawBody?: string }).rawBody = buf.toString('utf8')
      },
    })
  )
  app.use(express.json())
  app.use('/api', [
    router,
    handle(async () => {
      throw new RequestError('NotFound', RequestError.NotFound)
    }),
  ])
  return app
}
