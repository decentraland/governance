import API from 'decentraland-gatsby/dist/utils/api/API'
import { aggregateBalances } from '../entities/Balance/utils'

export class DclData extends API {

  static Url = (
    process.env.GATSBY_DCL_DATA_API ||
    'https://data.decentraland.vote/'
  )

  static Cache = new Map<string, DclData>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(this.Url)
  }

  async getData(){
    let data = await this.fetch(
      '/api.json',
      this.options()
        .method('GET')
    )
    data.balances = aggregateBalances(data.balances)
    return data
  }
}
