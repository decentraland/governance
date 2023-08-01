import API from 'decentraland-gatsby/dist/utils/api/API'
import env from 'decentraland-gatsby/dist/utils/env'
import uniqBy from 'lodash/uniqBy'

import { SNAPSHOT_API, SNAPSHOT_API_KEY, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorClient } from './ErrorClient'
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
const BATCH_SIZE = 1000

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

  constructor(baseUrl: string) {
    super(baseUrl)
    if (SNAPSHOT_API_KEY) this.defaultOptions.header('x-api-key', SNAPSHOT_API_KEY)
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

  fetchProposalVotes = async (proposal: string, skip: number, batchSize: number) => {
    const query = `
      query ProposalVotes($space: String!, $proposal: String!, $first: Int!, $skip: Int!) {
        votes (
          where: { space: $space, proposal: $proposal }
          first: $first, skip: $skip
        ) {
          voter
          created
          choice
          metadata
          vp
          vp_by_strategy
        }
      }
    `

    const result = await this.fetch<SnapshotVoteResponse>(
      GRAPHQL_ENDPOINT,
      this.options()
        .method('POST')
        .json({
          query,
          variables: { space: SNAPSHOT_SPACE, proposal: proposal, skip, first: batchSize },
        })
    )

    return result?.data?.votes
  }

  async getProposalVotes(proposalId: string): Promise<SnapshotVote[]> {
    return await inBatches(this.fetchProposalVotes, proposalId, BATCH_SIZE)
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

  async getAddressesVotes(addresses: string[]) {
    const query = `
      query AddressesVotes($space: String!, $addresses: [String]!, $created: Int!, $first: Int!) {
        votes (
          where: { space: $space, voter_in: $addresses, created_gt: $created },
          first: $first,
          orderBy: "created",
          orderDirection: asc
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

    let allResults: SnapshotVote[] = []
    let hasNext = true
    let created = 0

    try {
      while (hasNext) {
        const result = await this.fetch<SnapshotVoteResponse>(
          GRAPHQL_ENDPOINT,
          this.options()
            .method('POST')
            .json({
              query,
              variables: { space: SNAPSHOT_SPACE, addresses: addresses, first: 1000, created },
            })
        )

        const results = result?.data?.votes
        if (results && results.length > 0) {
          allResults = [...allResults, ...results]
          created = results[results.length - 1].created
        } else {
          hasNext = false
        }
      }
    } catch (error) {
      ErrorClient.report('Error fetching addresses votes', { error, addresses, category: ErrorCategory.Snapshot })
      return []
    }

    return allResults
  }

  async getAddressesVotesInBatches(addresses: string[], first: number, skip: number) {
    const query = `
      query AddressesVotes($space: String!, $addresses: [String]!, $first: Int!, $skip: Int!) {
        votes (
          where: { space: $space, voter_in: $addresses}
          first: $first, skip: $skip
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

    const result = await this.fetch<SnapshotVoteResponse>(
      GRAPHQL_ENDPOINT,
      this.options()
        .method('POST')
        .json({
          query,
          variables: { space: SNAPSHOT_SPACE, addresses: addresses, skip, first },
        })
    )

    return result?.data?.votes
  }

  async getAllVotesBetweenDates(start: Date, end: Date): Promise<SnapshotVote[]> {
    const query = `
      query getVotes($space: String!, $start: Int!, $end: Int!, $first: Int!) {
        votes(where: {space: $space, created_gte: $start, created_lt: $end}, orderBy: "created", orderDirection: asc, first: $first) {
          id
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

    let allResults: SnapshotVote[] = []
    let hasNext = true
    let created = getQueryTimestamp(start.getTime())
    const batchSize = 1000

    try {
      while (hasNext) {
        const result = await this.fetch<SnapshotVoteResponse>(
          GRAPHQL_ENDPOINT,
          this.options()
            .method('POST')
            .json({
              query,
              variables: {
                space: SNAPSHOT_SPACE,
                first: batchSize,
                start: created,
                end: getQueryTimestamp(end.getTime()),
              },
            })
        )

        const results = result?.data?.votes
        if (results && results.length > 0) {
          allResults = [...allResults, ...results]
          created = results[results.length - 1].created

          if (results.length < batchSize) {
            hasNext = false
          }
        } else {
          hasNext = false
        }
      }
    } catch (error) {
      ErrorClient.report('Error fetching votes', {
        error,
        space: SNAPSHOT_SPACE,
        start,
        end,
        category: ErrorCategory.Snapshot,
      })

      return []
    }

    return uniqBy(allResults, 'id')
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
    const { start, end, orderBy, scoresState, fields } = params
    const query = `
      query getProposals($space: String!, $start: Int!, $end: Int!, $first: Int!, $skip: Int!${
        scoresState ? ', $scores_state: String!' : ''
      }) {
        proposals(
          where: { space: $space, created_gte: $start, created_lt: $end${
            scoresState ? ', scores_state: $scores_state' : ''
          } },
          orderBy: "${orderBy || 'created_at'}",
          orderDirection: asc
          first: $first, skip: $skip
        ) {
          ${fields}
        }
      }
    `

    const variables: Record<string, unknown> = {
      space: SNAPSHOT_SPACE,
      start: getQueryTimestamp(start.getTime()),
      end: getQueryTimestamp(end.getTime()),
      first: batchSize,
      skip,
    }

    if (scoresState) {
      variables['scores_state'] = scoresState
    }

    const result = await this.fetch<SnapshotProposalsResponse>(
      GRAPHQL_ENDPOINT,
      this.options().method('POST').json({
        query,
        variables,
      })
    )

    return result?.data?.proposals
  }

  async getProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    return await inBatches(this.fetchProposals, { start, end, fields }, BATCH_SIZE)
  }

  async getPendingProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[], limit = 1000) {
    return await this.fetchProposals({ start, end, fields, scoresState: SnapshotScoresState.Pending }, 0, limit)
  }

  async getVpDistribution(address: string, proposalId?: string): Promise<VpDistribution> {
    const query = `
     query getVpDistribution($space: String!, $voter: String!, $proposal: String){
        vp (
          voter: $voter,
          space: $space,
          proposal: $proposal
        ) {
          vp
          vp_by_strategy
        } 
      }
    `
    const variables = {
      space: SNAPSHOT_SPACE,
      voter: address,
      proposal: proposalId || '',
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
      rental: Math.floor(vpByStrategy[StrategyOrder.Rental]),
    }
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
