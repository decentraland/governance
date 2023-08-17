import fetch from 'isomorphic-fetch'

import { OTTERSPACE_DAO_RAFT_ID, OTTERSPACE_QUERY_ENDPOINT } from '../entities/Snapshot/constants'
import { isProdEnv } from '../utils/governanceEnvs'

import { inBatches, trimLastForwardSlash } from './utils'

const BADGES_QUERY = `
query Badges($raft_id: String!, $address: Bytes!, $first: Int!, $skip: Int!) {
  badges: badges(
    where: {owner: $address, spec_: {raft: $raft_id}}, 
    first: $first, skip: $skip,
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    createdAt
    status
    statusReason
    spec {
      id
      metadata {
        name
        description
        expiresAt
        image
      }
      raft {
        id
        metadata {
          name
          image
        }
      }
    }
  }
}`

const BADGE_SPEC_OWNERS_QUERY = `
query Badges($badgeCid: String!) {
    badges: badges(
        where: {spec: $badgeCid}
        ){
           id
            owner {
                id
            }
           }
       }`

const RECIPIENTS_BADGE_ID_QUERY = `
query Badges($badgeCid: String!, $addresses: [String]!, $first: Int!, $skip: Int!) {
  badges: badges(
    where:{
      spec: $badgeCid,
      owner_in: $addresses
    },
    first: $first, skip: $skip,
     ) {
      id  
    owner {
      id
    }
  }
}
`

export type OtterspaceBadge = {
  id: string
  createdAt: number
  status: string
  statusReason: string
  owner?: { id: string }
  spec: {
    id: string
    metadata: {
      name: string
      description: string
      expiresAt?: number | null
      image: string
    }
    raft: {
      id: string
      metadata: {
        name: string
        image: string
      }
    }
  }
}

type BadgeOwnership = { id: string; address: string }

export class OtterspaceSubgraph {
  static Cache = new Map<string, OtterspaceSubgraph>()
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
    if (isProdEnv() && !OTTERSPACE_QUERY_ENDPOINT) {
      throw new Error(
        'Failed to determine otterspace query endpoint. Please check OTTERSPACE_QUERY_ENDPOINT env is defined'
      )
    }
    return OTTERSPACE_QUERY_ENDPOINT
  }

  async getBadgesForAddress(address: string) {
    const badges: OtterspaceBadge[] = await inBatches(
      async (vars, skip, first) => {
        const response = await fetch(this.queryEndpoint, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: BADGES_QUERY,
            variables: { ...vars, skip, first },
            operationName: 'Badges',
            extensions: { headers: null },
          }),
        })

        const body = await response.json()
        return body?.data?.badges || []
      },
      { address, raft_id: OTTERSPACE_DAO_RAFT_ID },
      20
    )

    return badges
  }

  async getBadgeOwners(badgeCid: string) {
    const badges: OtterspaceBadge[] = await inBatches(
      async (vars, skip, first) => {
        const response = await fetch(this.queryEndpoint, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: BADGE_SPEC_OWNERS_QUERY,
            variables: { ...vars, skip, first },
            operationName: 'Badges',
            extensions: { headers: null },
          }),
        })

        const body = await response.json()
        return body?.data?.badges || []
      },
      { badgeCid }
    )

    return badges.map((badge) => badge.owner?.id.toLowerCase()).filter(Boolean)
  }

  async getRecipientsBadgeIds(badgeCid: string, addresses: string[]): Promise<BadgeOwnership[]> {
    const badges: Pick<OtterspaceBadge, 'id' | 'owner'>[] = await inBatches(
      async (vars, skip, first) => {
        const response = await fetch(this.queryEndpoint, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: RECIPIENTS_BADGE_ID_QUERY,
            variables: { ...vars, skip, first },
            operationName: 'Badges',
            extensions: { headers: null },
          }),
        })

        const body = await response.json()
        return body?.data?.badges || []
      },
      { badgeCid, addresses }
    )

    return badges.map((badge) => {
      return { id: badge.id, address: badge.owner?.id || '' }
    })
  }
}
