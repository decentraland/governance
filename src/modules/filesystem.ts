import { createHash } from 'crypto'
import { DEFAULT_API_HEADERS, handleIncommingMessage } from 'decentraland-gatsby/dist/entities/Route/handle'
import { redirect } from 'decentraland-gatsby/dist/entities/Route/routes'
import { Router } from 'express'
import { Response } from 'express'
import { readFile } from 'fs'
import { default as glob } from 'glob'
import { resolve } from 'path'
import { extname } from 'path'
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
      return res.set('etag', JSON.stringify(etag)).type(extname(path)).status(status).send(data)
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
