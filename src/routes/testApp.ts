import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handle from 'decentraland-gatsby/dist/entities/Route/handle'
import express, { Express, Router } from 'express'
import { Server } from 'http'

/**
 * One listener per router, per test file.
 *
 * Handing the app itself to supertest makes it bind and tear down a server for every request, which
 * is thousands of short-lived listeners across a run and produced occasional socket resets. Binding
 * one per call is not enough either, because suites build their app in `beforeEach` — that is a
 * listener per test case, held open for the whole file.
 *
 * Jest gives each test file its own module registry, so this cache holds at most one server per
 * router per file, and `closeTestApps` (registered globally in test/setup/closeTestApps.ts) shuts
 * them down when the file finishes.
 */
const servers = new Map<Router, Server>()

function listen(router: Router, build: () => Express): Server {
  const existing = servers.get(router)
  if (existing) {
    return existing
  }
  const server = build().listen(0)
  server.unref()
  servers.set(router, server)
  return server
}

export async function closeTestApps(): Promise<void> {
  const open = [...servers.values()]
  servers.clear()
  await Promise.all(open.map((server) => new Promise<void>((resolve) => server.close(() => resolve()))))
}

/**
 * Mounts a single route module the way server.ts does — under /api, with the same
 * not-found fallback — so route tests exercise real path matching, middleware order and the
 * RequestError to status-code mapping done by handleAPI.
 *
 * The auth-chain verification itself is not exercised: tests that need an authenticated caller
 * mock decentraland-gatsby's auth middleware, so what is covered is whether a route requires
 * auth and what it does with the resulting address, not the signature checking behind it.
 */
export function createTestApp(router: Router): Server {
  return listen(router, () => {
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
  })
}

/**
 * Captures the raw request body under /api/webhooks exactly as server.ts does, so signature
 * tests cover the rawBody path rather than only the JSON.stringify fallback.
 */
export function createWebhookTestApp(router: Router): Server {
  return listen(router, () => {
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
  })
}
