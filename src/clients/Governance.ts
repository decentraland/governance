import env from '../config'
import { GOVERNANCE_API } from '../constants'

import API, { ApiOptions } from './API'
import { ApiResponse } from './ApiResponse'

const getGovernanceApiUrl = () => {
  if (process.env.GATSBY_HEROKU_APP_NAME) {
    return `https://governance.decentraland.vote/api`
  }

  return GOVERNANCE_API
}

export class Governance extends API {
  static Url = getGovernanceApiUrl()

  static Cache = new Map<string, Governance>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('GOVERNANCE_API', this.Url))
  }

  async fetchApiResponse<T>(endpoint: string, options: ApiOptions = { method: 'GET', sign: false }): Promise<T> {
    return (await this.fetch<ApiResponse<T>>(endpoint, options)).data
  }

  async reportErrorToServer(message: string, extraInfo?: Record<string, unknown>) {
    return await this.fetchApiResponse<string>(`/debug/report-error`, {
      method: 'POST',
      sign: true,
      json: { message, extraInfo },
    })
  }

  async checkImage(imageUrl: string) {
    return await this.fetchApiResponse<boolean>(`/proposals/linked-wearables/image?url=${imageUrl}`)
  }
}
