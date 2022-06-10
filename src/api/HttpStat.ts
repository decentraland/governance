import API from 'decentraland-gatsby/dist/utils/api/API'
import Options from 'decentraland-gatsby/dist/utils/api/Options'
import env from 'decentraland-gatsby/dist/utils/env'
import FetchError from 'decentraland-gatsby/dist/utils/errors/FetchError'
import RequestError from 'decentraland-gatsby/dist/utils/errors/RequestError'

export class HttpStat extends API {
  static Url = 'https://httpstat.us'

  static Cache = new Map<string, HttpStat>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('GOVERNANCE_API', this.Url))
  }

  async fetchResponse(responseType: string) {
    return await this.fetch(responseType, this.options().method('POST').authorization({ sign: true }))
    // try {
    // } catch (e) {
    //   return e
    // }
  }

  static catch<T>(prom: Promise<T>): Promise<T | null> {
    console.log('our static catch!', 'lalala')
    return prom
  }

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
    } catch (error) {
      throw new RequestError(url, opt.toObject(), res, error.message + ' at ' + body)
    }

    if (res.status >= 400) {
      throw new RequestError(url, opt.toObject(), res, json)
    }

    return json
  }
}
