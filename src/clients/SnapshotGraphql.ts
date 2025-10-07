import uniqBy from 'lodash/uniqBy'

import env from '../config'
import { SNAPSHOT_API, SNAPSHOT_API_KEY, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { getAMonthAgo } from '../utils/date/date'
import { ErrorCategory } from '../utils/errorCategories'

import API from './API'
import { ErrorClient } from './ErrorClient'
import {
  SnapshotConfig,
  SnapshotProposal,
  SnapshotProposalContent,
  SnapshotProposalResponse,
  SnapshotProposalsResponse,
  SnapshotQueryResponse,
  SnapshotScoresState,
  SnapshotSpace,
  SnapshotVote,
  SnapshotVoteResponse,
  SnapshotVpResponse,
  StrategyOrder,
  VpDistribution,
} from './SnapshotTypes'
import { inBatches, trimLastForwardSlash } from './utils'

export const getQueryTimestamp = (dateTimestamp: number) => Math.round(dateTimestamp / 1000)

const GRAPHQL_ENDPOINT = `/graphql`
const BATCH_SIZE = 1000
const GET_VOTES_QUERY = `
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

export class SnapshotGraphql extends API {
  static Url = SNAPSHOT_API || 'https://hub.snapshot.org/'
  static Cache = new Map<string, SnapshotGraphql>()

  static from(baseUrl: string): SnapshotGraphql {
    baseUrl = trimLastForwardSlash(baseUrl)
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }
    return this.Cache.get(baseUrl)!
  }

  static get(): SnapshotGraphql {
    return this.from(env('SNAPSHOT_API', this.Url))
  }

  constructor(baseUrl: string) {
    super(baseUrl)
    if (SNAPSHOT_API_KEY) {
      this.setDefaultHeader('x-api-key', SNAPSHOT_API_KEY)
    }
  }

  async getConfig() {
    const snapshotConfig = await this.fetch<SnapshotConfig>('/api/')

    return {
      ...snapshotConfig,
      version: snapshotConfig.version.split('#')[0],
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
            network
          }
        }
      }
    `

    const result = await this.fetch<SnapshotQueryResponse<{ space: SnapshotSpace }>>(GRAPHQL_ENDPOINT, {
      method: 'POST',
      json: { query, variables: { space } },
    })

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
          reason
        }
      }
    `

    const result = await this.fetch<SnapshotVoteResponse>(GRAPHQL_ENDPOINT, {
      method: 'POST',
      json: { query, variables: { space: SNAPSHOT_SPACE, proposal, first: batchSize, skip } },
    })

    return result?.data?.votes
  }

  async getVotesByProposal(proposalId: string): Promise<SnapshotVote[]> {
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
      const response = await this.fetch<SnapshotProposalResponse>(GRAPHQL_ENDPOINT, {
        method: 'POST',
        json: { query, variables: { proposal: proposalId } },
      })
      return response?.data.proposal.scores || []
    } catch (e) {
      throw Error(`Unable to fetch proposal scores for ${proposalId}`, e as Error)
    }
  }

  async getVotesByAddresses(addresses: string[]) {
    const query = `
      query VotesByAddresses($space: String!, $addresses: [String]!, $created: Int!, $first: Int!) {
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
        const result = await this.fetch<SnapshotVoteResponse>(GRAPHQL_ENDPOINT, {
          method: 'POST',
          json: {
            query,
            variables: { space: SNAPSHOT_SPACE, addresses: addresses, first: 1000, created },
          },
        })

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

  async getVotesByAddressesInBatches(addresses: string[], first: number, skip: number) {
    const query = `
      query getVotesByAddressesInBatches($space: String!, $addresses: [String]!, $first: Int!, $skip: Int!) {
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

    const result = await this.fetch<SnapshotVoteResponse>(GRAPHQL_ENDPOINT, {
      method: 'POST',
      json: {
        query,
        variables: { space: SNAPSHOT_SPACE, addresses: addresses, skip, first },
      },
    })

    return result?.data?.votes
  }

  async getVotesByDates(start: Date, end: Date): Promise<SnapshotVote[]> {
    let allResults: SnapshotVote[] = []
    let hasNext = true
    let created = getQueryTimestamp(start.getTime())
    const batchSize = 1000

    try {
      while (hasNext) {
        const variables = {
          space: SNAPSHOT_SPACE,
          first: batchSize,
          start: created,
          end: getQueryTimestamp(end.getTime()),
        }

        const result = await this.fetch<SnapshotVoteResponse>(GRAPHQL_ENDPOINT, {
          method: 'POST',
          json: {
            query: GET_VOTES_QUERY,
            variables,
          },
        })

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

    const result = await this.fetch<SnapshotProposalsResponse>(GRAPHQL_ENDPOINT, {
      method: 'POST',
      json: {
        query,
        variables,
      },
    })

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
     vp (voter: $voter, space: $space, proposal: $proposal) {
       vp
       vp_by_strategy
     }
   }
 `

    const variables = { space: SNAPSHOT_SPACE, voter: address, proposal: proposalId || '' }

    const result = await this.fetch<SnapshotVpResponse>(GRAPHQL_ENDPOINT, {
      method: 'POST',
      json: { query, variables },
    })

    if (!result?.data?.vp) throw Error('Unable to fetch VP Distribution')

    const vpByStrategy = result.data.vp.vp_by_strategy
    const total = Math.floor(result.data.vp.vp)

    const wMana = Math.floor(vpByStrategy[StrategyOrder.WrappedMana] || 0)
    const land = Math.floor(vpByStrategy[StrategyOrder.Land] || 0)
    const estate = Math.floor(vpByStrategy[StrategyOrder.Estate] || 0)
    const names = Math.floor(vpByStrategy[StrategyOrder.Names] || 0)
    const delegated = Math.floor(vpByStrategy[StrategyOrder.Delegation] || 0)
    const l1Wear = Math.floor(vpByStrategy[StrategyOrder.L1Wearables] || 0)
    const rental = Math.floor(vpByStrategy[StrategyOrder.Rental] || 0)
    const manaEth = Math.floor(vpByStrategy[StrategyOrder.ManaEth] || 0)
    const manaPol = Math.floor(vpByStrategy[StrategyOrder.ManaPolygon] || 0)
    const mana = Math.floor(manaEth + manaPol)

    return {
      total,
      own: Math.max(0, Math.floor(total - delegated)),
      wMana,
      land,
      estate,
      mana,
      names,
      delegated,
      l1Wearables: l1Wear,
      rental,
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
    >(GRAPHQL_ENDPOINT, {
      method: 'POST',
      json: { query, variables: { id: proposalSnapshotId } },
    })

    return result?.data?.proposal
  }

  async ping() {
    const now = new Date()
    const startTime = now.getTime()
    try {
      const startDate = getAMonthAgo(now).getTime()
      const endDate = now.getTime()
      const response = await this.fetch<SnapshotVoteResponse>(GRAPHQL_ENDPOINT, {
        method: 'POST',
        json: {
          query: GET_VOTES_QUERY,
          variables: {
            space: SNAPSHOT_SPACE,
            first: 10,
            start: getQueryTimestamp(startDate),
            end: getQueryTimestamp(endDate),
          },
        },
      })
      const endTime = new Date().getTime()
      const addressesSample = response?.data?.votes.map((vote: SnapshotVote) => vote.voter)
      return { responseTime: endTime - startTime, addressesSample }
    } catch (error) {
      return { responseTime: -1, addressesSample: [] } // Return -1 to indicate API failures
    }
  }
}
