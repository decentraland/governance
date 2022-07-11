import { ProposalGrantCategory, ProposalGrantTier } from '../entities/Proposal/types'
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

type Grants = {
  id: string
  category: ProposalGrantCategory
  tier: keyof typeof TransparencyGrantsTiers
  size: number
  status: string
  symbol: string
  title: string
  token: string
  user: string
  vesting_address: string
  vesting_released: number
  vesting_releasable: number
  vesting_start_at: string
  vesting_finish_at: number
  vesting_token_contract_balance: number
  vesting_total_amount: number
  enacting_tx: string
}[]

export const TransparencyGrantsTiers = {
  'Tier 1': ProposalGrantTier.Tier1,
  'Tier 2': ProposalGrantTier.Tier2,
  'Tier 3': ProposalGrantTier.Tier3,
  'Tier 4': ProposalGrantTier.Tier4,
  'Tier 5': ProposalGrantTier.Tier5,
  'Tier 6': ProposalGrantTier.Tier6,
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

  async getGrants() {
    return this.fetch<Grants>('/grants.json', this.options().method('GET'))
  }
}
