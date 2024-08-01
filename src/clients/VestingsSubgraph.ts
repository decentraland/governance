import fetch from 'isomorphic-fetch'

import { VESTINGS_QUERY_ENDPOINT } from '../entities/Snapshot/constants'

import { trimLastForwardSlash } from './utils'

export class VestingsSubgraph {
  static Cache = new Map<string, VestingsSubgraph>()
  private readonly queryEndpoint: string

  static from(baseUrl: string) {
    baseUrl = trimLastForwardSlash(baseUrl)
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(this.getQueryEndpoint())
  }

  constructor(baseUrl: string) {
    this.queryEndpoint = baseUrl
  }

  private static getQueryEndpoint() {
    if (!VESTINGS_QUERY_ENDPOINT) {
      throw new Error(
        'Failed to determine vestings subgraph query endpoint. Please check VESTINGS_QUERY_ENDPOINT env is defined'
      )
    }
    return VESTINGS_QUERY_ENDPOINT
  }

  async getVesting(address: string, blockNumber?: string | number) {
    const query = `
    query getVesting($address: String!, $block: Int) {
        vestings(where: { id: $address }) {
          id
          token
          owner
          beneficiary
          revoked
          revocable
          released
          start
          cliff
          periodDuration
          vestedPerPeriod
          duration
          paused
          pausable
          stop
          linear
          total
        }
        releaseLogs(where: {vesting: $address}, block: $block){
          id
          timestamp
          amount
        }
        pausedLogs(where: {vesting: $address}, block: $block){
          id
          timestamp
          eventType
        }
    }
    `

    const variables = { address, block: blockNumber }
    const response = await fetch(this.queryEndpoint, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: variables,
      }),
    })

    const body = await response.json()
    return body?.data
  }
}
