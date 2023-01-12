import API from 'decentraland-gatsby/dist/utils/api/API'

import { GrantTierType } from '../entities/Grant/types'
import { ProposalGrantCategory, ProposalStatus } from '../entities/Proposal/types'
import { TokenInWallet } from '../entities/Transparency/types'
import { ProjectHealth, UpdateStatus } from '../entities/Updates/types'

export type Detail = {
  name: string
  value: bigint
  description: string
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
  snapshot_id: string
  user: string
  type: string
  title: string
  start_at: number
  finish_at: number
  required_to_pass: number
  status: ProposalStatus
  configuration: any
  discourse_topic_id: number
  scores_total: number
  votes: number
  manaVP: number
  landVP: number
  namesVP: number
  delegatedVP: number
  vesting_address: null | string
  enacting_tx: null | string
  category: ProposalGrantCategory
  tier: keyof typeof TransparencyGrantsTiers
  size: number
  beneficiary: string
  token?: string
  tx_date?: number
  tx_amount?: number
  done_updates?: number
  late_updates?: number
  missed_updates?: number
  pending_updates?: number
  update_status?: UpdateStatus
  health?: ProjectHealth
  last_update?: number
  vesting_released?: number
  vesting_releasable?: number
  vesting_start_at?: number
  vesting_finish_at?: number
  vesting_token_contract_balance?: number
  vesting_total_amount?: number
  next_update?: number
}[]

// TODO: Maybe Transparency should share GrantTierType instead of overriding names
export const TransparencyGrantsTiers = {
  'Tier 1': GrantTierType.Tier1,
  'Tier 2': GrantTierType.Tier2,
  'Tier 3': GrantTierType.Tier3,
  'Tier 4': GrantTierType.Tier4,
  'Tier 5': GrantTierType.Tier5,
  'Tier 6': GrantTierType.Tier6,
  'Lower Tier': GrantTierType.LowerTier,
  'Higher Tier': GrantTierType.HigherTier,
}

export class DclData extends API {
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
