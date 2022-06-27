import snapshot from '@snapshot-labs/snapshot.js'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'
import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { Scores } from '../entities/Votes/utils'
import {GovernanceAPI} from "./GovernanceAPI";

export type SnapshotQueryResponse<T> = { data: T }

export type SnapshotResult = { ipfsHash: string }

export type SnapshotStatus = {
  name: string
  network: string
  version: string
  tag: string
  relayer: string
}

export type SnapshotStrategy = {
  name: string
  params: {
    symbol: string
    address: string
    decimals: number
  }
}

export type SnapshotSpace = {
  id: string
  network: string
  strategies: SnapshotStrategy[]
  // filters: {
  //   onlyMembers: boolean,
  //   invalids: string[],
  //   minScore: number
  // },
  // skin: string,
  // members: string[], // address
  // symbol: string,
  // name: string,
  // private: boolean
}

export type SnapshotMessage<T extends string, P extends {}> = {
  version: string
  timestamp: string
  space: string
  type: T
  payload: P
}

export type SnapshotRemoveProposalMessage = SnapshotMessage<'delete-proposal', { proposal: string }>
export type SnapshotNewProposalPayload = {
  name: string
  body: string
  end: Pick<Date, 'getTime'>
  start: Pick<Date, 'getTime'>
  snapshot: number
  choices: string[]
}

export type SnapshotVotePayload = {
  choice: number
  metadata: {}
  proposal: string
}

export type SnapshotVoteMessage = SnapshotMessage<'vote', SnapshotVotePayload>
export type SnapshotVoteResponse = SnapshotQueryResponse<{ votes: SnapshotVote[] }>
export type SnapshotVote = {
  id: string
  voter: string
  created: number
  choice: number
  proposal: {
    id: string
    title: string
    choices: string[]
  }
}

export type Delegation = {
  delegator: string
  delegate: string
  space: string
}

export type DelegationQueryResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
}

export type DelegationResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
  hasMoreDelegatedFrom: boolean
}

type ScoreDetail = {
  ownVp: number
  delegatedVp: number
  totalVp: number
}

export type DetailedScores = Record<string, ScoreDetail>

export const EMPTY_DELEGATION: DelegationResult = {
  delegatedTo: [],
  delegatedFrom: [],
  hasMoreDelegatedFrom: false,
}

const DELEGATION_STRATEGY_NAME = 'delegation'

export class Snapshot extends GovernanceAPI {
  static Url =
    process.env.GATSBY_SNAPSHOT_API ||
    process.env.REACT_APP_SNAPSHOT_API ||
    process.env.STORYBOOK_SNAPSHOT_API ||
    process.env.SNAPSHOT_API ||
    'https://hub.snapshot.org/'

  static Cache = new Map<string, Snapshot>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('SNAPSHOT_API', this.Url))
  }

  async send(address: string, msg: string, sig: string) {
    return this.fetch<SnapshotResult>('/api/message', this.options().method('POST').json({ address, msg, sig }))
  }

  async getStatus() {
    const status = await this.fetch<SnapshotStatus>('/api/')

    return {
      ...status,
      version: status.version.split('#')[0]
    }
  }

  async getSpace(space: string) {
    const query = `
      query Space($space: String!) {
        space(id: $space) {
          id
          network
          strategies {
            name
            params
          }
        }
      }
    `

    const result = await this.fetch<SnapshotQueryResponse<{ space: SnapshotSpace }>>(
      `/graphql`,
      this.options().method('POST').json({ query, variables: { space } })
    )

    return result?.data?.space || null
  }

  // async getProposals(space: string) {
  //   return this.fetch<Record<string, SnapshotProposal>>(`/api/${space}/proposals`)
  // }

  async createProposalMessage(
    space: string,
    version: string,
    network: string,
    strategies: SnapshotStrategy[],
    payload: SnapshotNewProposalPayload
  ) {
    const msg = {
      version,
      space,
      type: 'proposal',
      timestamp: Time.from().getTime().toString().slice(0, -3),
      payload: {
        ...payload,
        start: Number(payload.start.getTime().toString().slice(0, -3)),
        end: Number(payload.end.getTime().toString().slice(0, -3)),
        metadata: { network, strategies },
      },
    }

    return JSON.stringify(msg)
  }

  async removeProposalMessage(space: string, proposal: string) {
    const status = await this.getStatus()

    const msg: SnapshotRemoveProposalMessage = {
      space,
      type: 'delete-proposal',
      version: status.version,
      timestamp: Time.from().getTime().toString().slice(0, -3),
      payload: { proposal },
    }

    return JSON.stringify(msg)
  }

  async getProposalVotes(space: string, proposal: string) {
    let hasNext = true
    let skip = 0
    const first = 500
    const query = `
      query ProposalVotes($space: String!, $proposal: String!, $first: Int!, $skip: Int!) {
        votes (
          where: { space: $space, proposal: $proposal }
          first: $first, skip: $skip
        ) {
          voter
          created
          choice
        }
      }
    `

    let votes: SnapshotVote[] = []
    while (hasNext) {
      const result = await this.fetch<SnapshotVoteResponse>(
        `/graphql`,
        this.options().method('POST').json({ query, variables: { space, proposal, skip, first } })
      )

      const currentVotes = result?.data?.votes || []
      votes = [...votes, ...currentVotes]

      if (currentVotes.length < first) {
        hasNext = false
      } else {
        skip = currentVotes.length
      }
    }

    return votes
  }

  async getAddressVotes(space: string, address: string) {
    let hasNext = true
    let skip = 0
    const first = 500
    const query = `
      query Votes($space: String!, $address: String!, $first: Int!, $skip: Int!) {
        votes (
          first: $first,
          skip: $skip,
          where: {
            space: $space,
            voter: $address
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          voter
          created
          choice
          proposal {
            id
            title
            choices
          }
        }
      }
    `

    let votes: SnapshotVote[] = []
    while (hasNext) {
      const result = await this.fetch<SnapshotVoteResponse>(
        `/graphql`,
        this.options().method('POST').json({ query, variables: { space, address, skip, first } })
      )

      const currentVotes = result?.data?.votes || []
      votes = [...votes, ...currentVotes]

      if (currentVotes.length < first) {
        hasNext = false
      } else {
        skip = currentVotes.length
      }
    }

    return votes
  }

  async createVoteMessage(space: string, proposal: string, choice: number) {
    const status = await this.getStatus()

    const msg: SnapshotVoteMessage = {
      space,
      type: 'vote',
      version: status.version,
      timestamp: Time.from().getTime().toString().slice(0, -3),
      payload: { proposal, choice, metadata: {} },
    }

    return JSON.stringify(msg)
  }

  async getScores(
    space: string,
    strategies: SnapshotSpace['strategies'],
    network: SnapshotSpace['network'],
    addresses: string[],
    block?: string | number
  ) {
    addresses = addresses.map((addr) => addr.toLowerCase())
    const result: DetailedScores = {}
    const scores: Scores[] = await snapshot.utils.getScores(space, strategies, network, addresses, block)

    for (const addr of addresses) {
      result[addr] = {
        ownVp: 0,
        delegatedVp: Math.round(scores[strategies.findIndex((s) => s.name === DELEGATION_STRATEGY_NAME)][addr]) || 0,
        totalVp: 0,
      }
    }

    for (const score of scores) {
      for (const addr of Object.keys(score)) {
        const address = addr.toLowerCase()
        result[address].totalVp = (result[address].totalVp || 0) + Math.floor(score[addr] || 0)
      }
    }

    for (const address of Object.keys(result)) {
      result[address].ownVp = result[address].totalVp - result[address].delegatedVp
    }

    return result
  }

  async getLatestScores(space: string | SnapshotSpace, addresses: string[]) {
    const info = typeof space === 'string' ? await this.getSpace(space) : space
    return await this.getScores(info.id, info.strategies, info.network, addresses)
  }

  async getVotingPower(address: string, space: string) {
    const vp = await this.getLatestScores(space, [address])
    return Object.values(vp)[0]
  }
}

export function filterDelegationTo(delegations: Delegation[], space: string): Delegation[] {
  if (delegations.length > 1) {
    return delegations.filter((delegation) => delegation.space === space)
  }

  return delegations
}

export function filterDelegationFrom(delegations: Delegation[], space: string): Delegation[] {
  if (delegations.length === 0) {
    return []
  }

  const unique_delegations = new Map<string, Delegation>()

  for (const deleg of delegations) {
    if (unique_delegations.has(deleg.delegator)) {
      if (unique_delegations.get(deleg.delegator)?.space !== space) {
        unique_delegations.set(deleg.delegator, deleg)
      }
    } else {
      unique_delegations.set(deleg.delegator, deleg)
    }
  }

  return Array.from(unique_delegations.values())
}

export async function fetchAndFilterDelegates(query: string, variables: any): Promise<DelegationResult> {
  try {
    const request = await fetch(SNAPSHOT_QUERY_ENDPOINT, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })
    const body = await request.json()
    const data = body.data as DelegationQueryResult
    if (!data) {
      return EMPTY_DELEGATION
    }
    const filteredDelegatedFrom = filterDelegationFrom(data.delegatedFrom, SNAPSHOT_SPACE)
    return {
      delegatedTo: filterDelegationTo(data.delegatedTo, SNAPSHOT_SPACE),
      delegatedFrom: filteredDelegatedFrom.slice(0, 99),
      hasMoreDelegatedFrom: filteredDelegatedFrom.length > 99,
    }
  } catch (error) {
    console.error(error)
    return EMPTY_DELEGATION
  }
}
