import API from 'decentraland-gatsby/dist/utils/api/API'
import { TokenInWallet } from '../entities/Transparency/types'

export type Detail = {
  name: string,
  value: bigint
}

export type MonthlyTotal = {
  total: bigint,
  previous: bigint,
  details: Detail[]
}

export type Member = {
  address: string,
  name: string,
  team: string
}

export type DlcData = {
  balances: TokenInWallet[],
  income: MonthlyTotal,
  expenses: MonthlyTotal,
  funding: {
    total: bigint,
    budget: bigint
  },
  members: Member[]
}

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
    return this.fetch<DlcData>(
      '/api.json',
      this.options()
        .method('GET')
    )
  }
}
