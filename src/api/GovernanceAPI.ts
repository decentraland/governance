import API from 'decentraland-gatsby/dist/utils/api/API'
import Options from 'decentraland-gatsby/dist/utils/api/Options'
import FetchError from 'decentraland-gatsby/dist/utils/errors/FetchError'
import RequestError from 'decentraland-gatsby/dist/utils/errors/RequestError'

export class GovernanceAPI extends API {
  // @ts-ignore
  async fetch<T extends Record<string, unknown>>(path: string, options: Options = new Options({})): Promise<T> {
    let body = ''
    let json: T = null as any
    const url = this.url(path)

    let opt = this.defaultOptions.merge(options)
    opt = await this.authorizeOptions(path, opt)
    opt = await this.signOptions(path, opt)

    const res = await fetch(url, opt.toObject())
    if (!res.ok) {
      throw new FetchError(url, opt.toObject(), await res.text())
    }

    try {
      body = await res.text()
    } catch (error) {
      throw new RequestError(url, opt.toObject(), res, body)
    }

    try {
      json = JSON.parse(body || '{}') as T
    } catch (parsingError) {
      // @ts-ignore
      return body
    }

    if (res.status >= 400) {
      throw new RequestError(url, opt.toObject(), res, json)
    }

    return json
  }
}
