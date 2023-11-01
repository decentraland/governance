import API from 'decentraland-gatsby/dist/utils/api/API'

import { ProjectStatus } from '../entities/Grant/types'
import { TokenInWallet } from '../entities/Transparency/types'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorClient } from './ErrorClient'

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
  address: string
  name: string
}

export enum CommitteeName {
  SAB = 'Security Advisory Board',
  DAOCommitee = 'DAO Committee',
  WearableCuration = 'Wearable Curation Committee',
  Revocation = 'Revocation Committee',
}

export type Committee = {
  name: CommitteeName
  size: number
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
  committees: Committee[]
}

export type TransparencyBudget = {
  start_date: string
  total: number
  category_percentages: Record<string, number>
}

export type TransparencyVesting = {
  proposal_id: string
  token: string
  vesting_address: string
  vesting_released: number
  vesting_releasable: number
  vesting_start_at: string
  vesting_finish_at: string
  vesting_contract_token_balance: number
  vesting_total_amount: number
  vesting_status: ProjectStatus
  duration_in_months: number
}

const EMPTY_API: TransparencyData = {
  balances: [],
  income: {
    total: BigInt(0),
    previous: BigInt(0),
    details: [],
  },
  expenses: {
    total: BigInt(0),
    previous: BigInt(0),
    details: [],
  },
  funding: {
    total: BigInt(0),
    budget: BigInt(0),
  },
  committees: [],
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

  private async trycatch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      ErrorClient.report('Failed to fetch transparency data', { error, category: ErrorCategory.Transparency })
      return fallback
    }
  }

  async getData() {
    return this.trycatch(() => this.fetch<TransparencyData>('/api.json', this.options().method('GET')), EMPTY_API)
  }

  async getBudgets() {
    return this.trycatch(() => this.fetch<TransparencyBudget[]>('/budgets.json', this.options().method('GET')), [])
  }

  async getVestings() {
    return this.trycatch(() => this.fetch<TransparencyVesting[]>('/vestings.json', this.options().method('GET')), [])
  }
}
