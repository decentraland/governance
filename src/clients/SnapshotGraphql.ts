import API from 'decentraland-gatsby/dist/utils/api/API'
import env from 'decentraland-gatsby/dist/utils/env'
import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

import { inBatches, trimLastForwardSlash } from './utils'

export type SnapshotQueryResponse<T> = { data: T }

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
}

export type SnapshotVoteResponse = SnapshotQueryResponse<{ votes: SnapshotVote[] }>
export type SnapshotVote = {
  id?: string
  voter: string
  created: number
  choice: number
  proposal?: {
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

export type VoteEventResponse = SnapshotQueryResponse<{ votes: VoteEvent[] }>
export type VoteEvent = {
  voter: string
  created: number
  vp: number
  choice: number
  proposal: {
    id: string
    choices: string[]
  }
}

export type SnapshotProposalResponse = SnapshotQueryResponse<{ proposals: Partial<SnapshotProposal>[] }>
export type SnapshotProposal = {
  id: string
  ipfs: string
  author: string
  created: number
  type: string
  title: string
  body: string
  choices: string[]
  start: number
  end: number
  snapshot: string
  state: string
  link: string
  scores: number[]
  scores_by_strategy: number[]
  scores_state: string
  scores_total: number
  scores_updated: number
  votes: number
}

enum SnapshotScoresState {
  Pending = 'pending',
  Final = 'final',
}

const getQueryTimestamp = (dateTimestamp: number) => Math.round(dateTimestamp / 1000)

const GRAPHQL = `/graphql`

export class SnapshotGraphql extends API {
  static Url =
    process.env.GATSBY_SNAPSHOT_API ||
    process.env.REACT_APP_SNAPSHOT_API ||
    process.env.STORYBOOK_SNAPSHOT_API ||
    process.env.SNAPSHOT_API ||
    'https://hub.snapshot.org/'

  static Cache = new Map<string, SnapshotGraphql>()

  static from(baseUrl: string) {
    baseUrl = trimLastForwardSlash(baseUrl)
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('SNAPSHOT_API', this.Url))
  }

  async getStatus() {
    const status = await this.fetch<SnapshotStatus>('/api/')

    return {
      ...status,
      version: status.version.split('#')[0],
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
      GRAPHQL,
      this.options().method('POST').json({ query, variables: { space } })
    )

    return result?.data?.space || null
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
        GRAPHQL,
        this.options().method('POST').json({ query, variables: { space, proposal, skip, first } })
      )

      const currentVotes = result?.data?.votes || []
      votes = [...votes, ...currentVotes]

      if (currentVotes.length < first) {
        hasNext = false
      } else {
        skip = votes.length
      }
    }

    return votes
  }

  async getAddressVotes(address: string) {
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
        GRAPHQL,
        this.options()
          .method('POST')
          .json({ query, variables: { space: SNAPSHOT_SPACE, address, skip, first } })
      )

      const currentVotes = result?.data?.votes || []
      votes = [...votes, ...currentVotes]

      if (currentVotes.length < first) {
        hasNext = false
      } else {
        skip = votes.length
      }
    }
    return votes
  }

  fetchAddressesVotesByDate = async (params: { addresses: string[] }, skip: number, batchSize: number) => {
    const query = `
      query ProposalVotes($space: String!, $addresses: [String]!, $first: Int!, $skip: Int!) {
        votes (
          where: { space: $space, voter_in: $addresses}
          first: $first, skip: $skip
          orderBy: "created",
          orderDirection: desc
        ) {
          voter
          created
        }
      }
    `

    const result = await this.fetch<SnapshotVoteResponse>(
      GRAPHQL,
      this.options()
        .method('POST')
        .json({
          query,
          variables: { space: SNAPSHOT_SPACE, addresses: params.addresses, skip, first: batchSize },
        })
    )

    return result?.data?.votes
  }

  async getAddressesVotesByDate(addresses: string[]) {
    const batchSize = 5000
    return await inBatches(this.fetchAddressesVotesByDate, { addresses }, batchSize)
  }

  fetchVotes = async (params: { start: Date; end: Date }, skip: number, batchSize: number) => {
    const query = `
      query getVotes($space: String!, $start: Int!, $end: Int!, $first: Int!, $skip: Int!) {
        votes(where: {space: $space, created_gte: $start, created_lt: $end}, orderBy: "created", orderDirection: asc, first: $first, skip: $skip) {
          voter
          created
          vp
          choice
          proposal {
            id
            choices
          }
        }
      }
    `

    const result = await this.fetch<VoteEventResponse>(
      GRAPHQL,
      this.options()
        .method('POST')
        .json({
          query,
          variables: {
            space: SNAPSHOT_SPACE,
            start: getQueryTimestamp(params.start.getTime()),
            end: getQueryTimestamp(params.end.getTime()),
            first: batchSize,
            skip,
          },
        })
    )

    return result?.data?.votes
  }

  async getVotes(start: Date, end: Date) {
    const batchSize = 20000
    return await inBatches(this.fetchVotes, { start, end }, batchSize)
  }

  fetchProposals = async (
    params: {
      start: Date
      end: Date
      orderBy?: string
      scoresState?: SnapshotScoresState
      fields: (keyof SnapshotProposal)[]
    },
    skip: number,
    batchSize: number
  ) => {
    const query = `
      query getProposals($space: String!, $start: Int!, $end: Int!, $first: Int!, $skip: Int!, $scores_state: String!) {
        proposals(
          where: { space: $space, created_gte: $start, created_lt: $end, scores_state: $scores_state },
          orderBy: ${params.orderBy || '"created_at"'},
          orderDirection: asc
          first: $first, skip: $skip
        ) {
          ${params.fields}
        }
      }
    `

    const result = await this.fetch<SnapshotProposalResponse>(
      GRAPHQL,
      this.options()
        .method('POST')
        .json({
          query,
          variables: {
            space: SNAPSHOT_SPACE,
            start: getQueryTimestamp(params.start.getTime()),
            end: getQueryTimestamp(params.end.getTime()),
            scores_state: params.scoresState || '',
            first: batchSize,
            skip,
          },
        })
    )

    return result?.data?.proposals
  }

  async getProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    const batchSize = 1000
    return await inBatches(this.fetchProposals, { start, end, fields }, batchSize)
  }

  async getPendingProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[], limit = 1000) {
    return await this.fetchProposals({ start, end, fields, scoresState: SnapshotScoresState.Pending }, 0, limit)
  }

  async fetchDelegates(query: string, variables: any) {
    const request = await fetch(SNAPSHOT_QUERY_ENDPOINT, {
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
