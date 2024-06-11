import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT } from '../entities/Snapshot/constants'
import { PICKED_BY_QUERY } from '../entities/Snapshot/queries'

import { Delegation } from './SnapshotTypes'
import { inBatches, trimLastForwardSlash } from './utils'

export type DelegationQueryResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
}

export type PickedByResult = {
  address: string
  pickedBy: number
}

export class SnapshotSubgraph {
  static Cache = new Map<string, SnapshotSubgraph>()
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
    if (!SNAPSHOT_QUERY_ENDPOINT) {
      throw new Error(
        'Failed to determine snapshot query endpoint. Please check SNAPSHOT_QUERY_ENDPOINT env is defined'
      )
    }
    return SNAPSHOT_QUERY_ENDPOINT
  }

  async getDelegates(
    key: 'delegatedTo' | 'delegatedFrom',
    query: string,
    variables: { address: string; space: string; blockNumber?: string | number }
  ) {
    const delegations: Delegation[] = await inBatches(
      async (vars, skip, first) => {
        const response = await fetch(this.queryEndpoint, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { ...vars, skip, first },
          }),
        })

        const body = await response.json()
        return body?.data?.[key] || []
      },
      { ...variables },
      500
    )

    return delegations
  }

  async getPickedBy(addresses: string[], space: string) {
    if (!addresses || !space) {
      return []
    }

    const delegations: Delegation[] = await inBatches(
      async (vars, skip, batchSize) => {
        const response = await fetch(SNAPSHOT_QUERY_ENDPOINT, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: PICKED_BY_QUERY,
            variables: { ...vars, skip, first: batchSize },
          }),
        })

        const body = await response.json()
        return body?.data?.delegatedFrom || []
      },
      { address: addresses, space },
      500
    )

    const pickedBy = new Map<string, Set<string>>()

    for (const addr of addresses) {
      const filteredDelegations = delegations.filter((deleg) => deleg.delegate === addr)
      pickedBy.set(addr, new Set())

      if (filteredDelegations.length > 0) {
        for (const deleg of filteredDelegations) {
          pickedBy.get(deleg.delegate)?.add(deleg.delegator)
        }
      }
    }

    const result: PickedByResult[] = []

    for (const entry of pickedBy.entries()) {
      const address = entry[0]
      const pickedBy = entry[1].size
      result.push({ address, pickedBy })
    }

    return result
  }
}
