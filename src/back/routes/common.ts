import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import isURL from 'validator/lib/isURL'

export default routes((router) => {
  return router.post('/url-title', handleAPI(checkUrlTitle))
})

const fetchWithTimeout = async (url: string, timeout = 10000, options?: RequestInit) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

const isHttpsURL = (url: string) => isURL(url, { protocols: ['https'], require_protocol: true })

async function getTitle(url: string) {
  const response = await fetchWithTimeout(url, 6000)
  const text = await response.text()
  const title = text.match(/<title>([^<]+)<\/title>/)?.[1]
  return title
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkUrlTitle(req: Request<any, any, { url: string }>) {
  const { url } = req.body
  if (!url) {
    throw new Error('Missing url')
  }

  if (!isHttpsURL(url)) {
    throw new Error('Invalid url: ' + url)
  }

  const title = await getTitle(url)
  return { title }
}
