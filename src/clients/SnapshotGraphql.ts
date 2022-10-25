import API from 'decentraland-gatsby/dist/utils/api/API'
import env from 'decentraland-gatsby/dist/utils/env'

import { SNAPSHOT_API, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

import {
  SnapshotProposal,
  SnapshotProposalContent,
  SnapshotProposalResponse,
  SnapshotProposalsResponse,
  SnapshotQueryResponse,
  SnapshotScoresState,
  SnapshotSpace,
  SnapshotStatus,
  SnapshotVote,
  SnapshotVoteResponse,
  SnapshotVpResponse,
  StrategyOrder,
  VpDistribution,
} from './SnapshotGraphqlTypes'
import { inBatches, trimLastForwardSlash } from './utils'

export const getQueryTimestamp = (dateTimestamp: number) => Math.round(dateTimestamp / 1000)

const GRAPHQL_ENDPOINT = `/graphql`

export class SnapshotGraphql extends API {
  static Url = SNAPSHOT_API || 'https://hub.snapshot.org/'

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
      GRAPHQL_ENDPOINT,
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
        GRAPHQL_ENDPOINT,
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

  async getProposalScores(proposalId: string) {
    const query = `
      query ProposalScores($proposal: String!) {
        proposal (
          id: $proposal 
        ) {
          scores
        }
      }
    `
    try {
      const response = await this.fetch<SnapshotProposalResponse>(
        GRAPHQL_ENDPOINT,
        this.options()
          .method('POST')
          .json({ query, variables: { proposal: proposalId } })
      )
      return response?.data.proposal.scores || []
    } catch (e) {
      throw Error(`Unable to fetch proposal scores for ${proposalId}`, e as Error)
    }
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
            scores
            state
          }
        }
      }
    `

    let votes: SnapshotVote[] = []
    while (hasNext) {
      const result = await this.fetch<SnapshotVoteResponse>(
        GRAPHQL_ENDPOINT,
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

  fetchAddressesVotes = async (params: { addresses: string[] }, skip: number, batchSize: number) => {
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
          choice
          proposal {
            id
            title
            choices
            scores
            state
          }
        }
      }
    `

    const result = await this.fetch<SnapshotVoteResponse>(
      GRAPHQL_ENDPOINT,
      this.options()
        .method('POST')
        .json({
          query,
          variables: { space: SNAPSHOT_SPACE, addresses: params.addresses, skip, first: batchSize },
        })
    )

    return result?.data?.votes
  }

  async getAddressesVotes(addresses: string[]) {
    const batchSize = 5000
    return await inBatches(this.fetchAddressesVotes, { addresses }, batchSize)
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

    const result = await this.fetch<SnapshotVoteResponse>(
      GRAPHQL_ENDPOINT,
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

    const result = await this.fetch<SnapshotProposalsResponse>(
      GRAPHQL_ENDPOINT,
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

  async getVpDistribution(address: string): Promise<VpDistribution> {
    const query = `
     query getVpDistribution($space: String!, $voter: String!){
        vp (
          voter: $voter,
          space: $space
        ) {
          vp
          vp_by_strategy
        } 
      }
    `
    const variables = {
      space: SNAPSHOT_SPACE,
      voter: address,
    }

    const result = await this.fetch<SnapshotVpResponse>(
      GRAPHQL_ENDPOINT,
      this.options().method('POST').json({
        query,
        variables: variables,
      })
    )

    if (!result?.data?.vp) {
      throw Error('Unable to fetch VP Distribution')
    }

    const vpByStrategy = result?.data?.vp.vp_by_strategy

    return {
      total: Math.floor(result?.data?.vp.vp),
      own: Math.floor(result?.data?.vp.vp - vpByStrategy[5]),
      wMana: Math.floor(vpByStrategy[StrategyOrder.WrappedMana]),
      land: Math.floor(vpByStrategy[StrategyOrder.Land]),
      estate: Math.floor(vpByStrategy[StrategyOrder.Estate]),
      mana: Math.floor(vpByStrategy[StrategyOrder.Mana]),
      names: Math.floor(vpByStrategy[StrategyOrder.Names]),
      delegated: Math.floor(vpByStrategy[StrategyOrder.Delegation]),
      l1Wearables: Math.floor(vpByStrategy[StrategyOrder.L1Wearables]),
    }
  }

  async getProposalSpaceAndStrategies(proposalSnapshotId: string) {
    const query = `
      query Proposal($proposal_snapshot_id: String!) {
        proposal(id: $proposal_snapshot_id){
          space {
            id
            network
          }
          strategies {
            name
            params
          }
        }
      }
    `

    const result = await this.fetch<
      SnapshotQueryResponse<{ proposal: Pick<SnapshotProposal, 'space' | 'strategies'> }>
    >(
      GRAPHQL_ENDPOINT,
      this.options()
        .method('POST')
        .json({ query, variables: { proposal_snapshot_id: proposalSnapshotId } })
    )

    return result?.data?.proposal
  }

  async getProposalContent(proposalSnapshotId: string) {
    const query = `
      query Proposal($id: String!) {
        proposal(id: $id){
          space {
            id
          }
          type
          title
          body
          choices
          start
          end
          snapshot
          plugins
          app
          discussion
          author
          created
        }
      }
    `

    const result = await this.fetch<
      SnapshotQueryResponse<{
        proposal: SnapshotProposalContent
      }>
    >(
      GRAPHQL_ENDPOINT,
      this.options()
        .method('POST')
        .json({ query, variables: { id: proposalSnapshotId } })
    )

    return result?.data?.proposal
  }
}
