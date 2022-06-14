import env from 'decentraland-gatsby/dist/utils/env'

import { GovernanceAPI } from './GovernanceAPI'

export class HttpStat extends GovernanceAPI {
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

  async fetchResponse(responseType: string, sleepTime: number) {
    if (sleepTime > 0) {
      responseType += '?sleep=' + sleepTime
    }
    return await this.fetch(responseType, this.options().method('POST').authorization({ sign: true }))
  }
}
