import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT } from '../entities/Snapshot/constants'

import { Delegation } from './SnapshotGraphql'
import { trimLastForwardSlash } from './utils'

export type DelegationQueryResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
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

  async fetchDelegates(query: string, variables: any) {
    const request = await fetch(this.queryEndpoint, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })
    const body = await request.json()
    return body.data as DelegationQueryResult
  }
}
