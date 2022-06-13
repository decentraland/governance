import { TokenInWallet } from '../entities/Transparency/types'

import { GovernanceAPI } from './GovernanceAPI'

export type Detail = {
  name: string
  value: bigint
}

export type MonthlyTotal = {
  total: bigint
  previous: bigint
  details: Detail[]
}

export type Member = {
  avatar: string
  name: string
}

export type Team = {
  name: string
  description: string
  members: Member[]
}

export type TransparencyData = {
  balances: TokenInWallet[]
  income: MonthlyTotal
  expenses: MonthlyTotal
  funding: {
    total: bigint
    budget: bigint
  }
  teams: Team[]
}

export class DclData extends GovernanceAPI {
  static Url = process.env.GATSBY_DCL_DATA_API || 'https://data.decentraland.vote/'

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

  async getData() {
    return this.fetch<TransparencyData>('/api.json', this.options().method('GET'))
  }
}
