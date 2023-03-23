import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { fetchWithTimeout, isHttpsURL } from '../../helpers'

export default routes((router) => {
  return router.post('/url-title', handleAPI(checkUrlTitle))
})

async function getTitle(url: string) {
  const response = await fetchWithTimeout(url, 6000)
  const text = await response.text()
  const title = text.match(/<title>([^<]+)<\/title>/)?.[1]
  return title
}

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
