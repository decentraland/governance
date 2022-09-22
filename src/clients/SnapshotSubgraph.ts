import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT } from '../entities/Snapshot/constants'
import { PICKED_BY_QUERY } from '../entities/Snapshot/queries'

import { Delegation } from './SnapshotGraphql'
import { trimLastForwardSlash } from './utils'

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
    let hasNext = true
    let skip = 0
    const first = 500

    let delegations: Delegation[] = []
    while (hasNext) {
      const response = await fetch(this.queryEndpoint, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          variables: { ...variables, skip, first },
        }),
      })

      const body = await response.json()
      const currentDelegations = body?.data?.[key] || []
      delegations = [...delegations, ...currentDelegations]

      if (currentDelegations.length < first) {
        hasNext = false
      } else {
        skip = delegations.length
      }
    }

    return delegations
  }

  async getPickedBy(variables: { address: string[]; space: string }) {
    const { address, space } = variables

    if (!address || !space) {
      return []
    }

    let hasNext = true
    let skip = 0
    const first = 500

    let delegations: Delegation[] = []
    while (hasNext) {
      const response = await fetch(SNAPSHOT_QUERY_ENDPOINT, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: PICKED_BY_QUERY,
          variables: { ...variables, skip, first },
        }),
      })

      const body = await response.json()
      const currentDelegations = body?.data?.delegatedFrom || []
      delegations = [...delegations, ...currentDelegations]

      if (currentDelegations.length < first) {
        hasNext = false
      } else {
        skip = delegations.length
      }
    }

    const pickedBy = new Map<string, Set<string>>()

    for (const addr of address) {
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
