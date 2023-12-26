import { createHash } from 'crypto'
import { DEFAULT_API_HEADERS, handleIncommingMessage } from 'decentraland-gatsby/dist/entities/Route/handle'
import { redirect } from 'decentraland-gatsby/dist/entities/Route/routes'
import { Response, Router } from 'express'
import { readFile } from 'fs'
import { default as glob } from 'glob'
import { extname, resolve } from 'path'
import { promisify } from 'util'

export type FilesystemHandleOptions = {
  indexFile: string
  notFoundFile: string
}

function filesystemOptions(value: string | Partial<FilesystemHandleOptions>): FilesystemHandleOptions {
  const options = typeof value === 'string' ? { notFoundFile: value } : value

  return {
    indexFile: 'index.html',
    notFoundFile: '404.html',
    ...options,
  }
}

function file(
  path: string,
  status = 200,
  options?: {
    defaultHeaders?: Record<string, string>
    api?: boolean
  }
) {
  let reader: Promise<readonly [Buffer, string]> | null = null
  return handleIncommingMessage(
    async (_, res: Response) => {
      if (!reader) {
        reader = (async () => {
          const data = await readOnce(path)
          const hash = createHash('sha256')
          hash.write(data)
          const etag = hash.digest('hex')
          return [data, etag] as const
        })()
      }

      const [data, etag] = await reader
      return res
        .set('cache-control', 'private,no-store,max-age=0')
        .set('etag', JSON.stringify(etag))
        .type(extname(path))
        .status(status)
        .send(data)
    },
    { defaultHeaders: DEFAULT_API_HEADERS, api: true, ...options }
  )
}

const files = new Map<string, Promise<Buffer>>()
export async function readOnce(path: string) {
  if (!files.has(path)) {
    files.set(
      path,
      promisify(readFile)(path).catch(() => Buffer.alloc(0))
    )
  }

  return files.get(path)!
}

export default function filesystem(
  path: string,
  notFoundPage: string | Partial<FilesystemHandleOptions>,
  options?: {
    defaultHeaders?: Record<string, string>
    api?: boolean
  }
) {
  const router = Router()
  const fileSystemOptions = filesystemOptions(notFoundPage)
  const indexFile = '/' + fileSystemOptions.indexFile
  const cwd = resolve(process.cwd(), path)
  const files = Array.from(new Set(glob.sync('**/*', { cwd, nodir: true })).values()).sort()

  for (const filePath of files) {
    const webPath = '/' + filePath // => /en/index.html

    if (webPath.endsWith(indexFile)) {
      const basePath = webPath.slice(0, -10)
      router.get(webPath, redirect(basePath)) // redirect /en/index.html => /en/
      router.get(basePath, file(resolve(cwd, filePath), 200, options)) // load /en/index.html on /en/
    } else {
      router.get(webPath, file(resolve(cwd, filePath), 200, options)) // load /en/other.html
    }
  }

  router.use(file(resolve(cwd, fileSystemOptions.notFoundFile), 404, options))
  return router
}

// CSP configurations
export const cspChildSrc = ['https:'].join(' ')
const HEROKU_DOMAIN = process.env.HEROKU_APP_NAME
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
  : 'https://dcl-governance.herokuapp.com'

export const cspConnectSrc = [
  'https:',
  'wss:',
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspFontSrc = [
  'https:',
  'data:',
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspImageSrc = [
  'https:',
  'data:',
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspManifestSrc = [
  "'self'",
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspFormAction = [
  "'self'",
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspMediaSrc = [
  "'self'",
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspDefaultSrc = [
  "'self'",
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
export const cspStyleSrc = ["'unsafe-inline'", 'https:', 'data:', 'http://127.0.0.1:*'].join(' ')
export const cpsScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  'blob:',
  'https://decentraland.org',
  'https://*.decentraland.org',
  'https://cdn.segment.com',
  'https://cdn.rollbar.com',
  'https://ajax.cloudflare.com',
  'https://googleads.g.doubleclick.net',
  'https://ssl.google-analytics.com',
  'https://tagmanager.google.com',
  'https://www.google-analytics.com',
  'https://www.google-analytics.com',
  'https://www.google.com',
  'https://www.googleadservices.com',
  'https://www.googletagmanager.com',
  'https://verify.walletconnect.com',
  'https://*.decentraland.org',
  'https://*.decentraland.today',
  'https://*.decentraland.zone',
  'https://governance.decentraland.vote',
  HEROKU_DOMAIN,
  // Used to test the proxied service
  // 'http://127.0.0.1:*',
].join(' ')
