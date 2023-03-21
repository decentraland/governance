import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import isURL from 'validator/lib/isURL'

export default routes((router) => {
  return router.post('/urlTitle', handleAPI(urlTitle))
})

async function getTitle(url: string) {
  const response = await fetch(url)
  const text = await response.text()
  const title = text.match(/<title>([^<]+)<\/title>/)?.[1]
  return title
}

async function urlTitle(req: Request<any, any, { url: string }>) {
  const { url } = req.body
  if (!url) {
    throw new Error('Missing url')
  }

  if (!isURL(url)) {
    throw new Error('Invalid url: ' + url)
  }

  const title = await getTitle(url)
  return { title }
}
