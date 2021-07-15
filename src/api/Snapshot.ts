import API from 'decentraland-gatsby/dist/utils/api/API'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'

export type SnapshotQueryResponse<T> = { data: T }

export type SnapshotResult = { ipfsHash: string }

export type SnapshotStatus = {
  name: string,
  network: string,
  version: string,
  tag: string,
  relayer: string,
}

export type SnapshotStrategy = {
  name: string
  params: {
    symbol: string,
    address: string,
    decimals: number
  }
}

export type SnapshotSpace = {
  id: string,
  network: string,
  strategies: SnapshotStrategy[],
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
  version: string,
  timestamp: string,
  space: string,
  type: T,
  payload: P
}

export type SnapshotProposalPayload = {
  end: number,
  body: string,
  name: string,
  start: number,
  choices: string[],
  metadata: {
    strategies: SnapshotStrategy[]
  },
  snapshot: number
}

export type SnapshotRemoveProposalMessage = SnapshotMessage<"delete-proposal", { proposal: string }>
export type SnapshotProposalMessage = SnapshotMessage<"proposal", SnapshotProposalPayload>
export type SnapshotNewProposalPayload = {
  name: string,
  body: string,
  end: Pick<Date, 'getTime'>,
  start: Pick<Date, 'getTime'>,
  snapshot: number,
  choices: string[]
}

export type SnapshotProposal = {
  address: string,
  msg: SnapshotProposalMessage,
  sig: string,
  authorIpfsHash: string
  relayerIpfsHash: string
}

export type SnapshotVotePayload = {
  choice: number,
  metadata: {},
  proposal: string
}

export type SnapshotVoteMessage = SnapshotMessage<"vote", SnapshotVotePayload>
export type SnapshotVoteResponse = SnapshotQueryResponse<{ votes: SnapshotVote[] }>
export type SnapshotVote = {
  voter: string,
  created: number,
  choice: number
}

export class Snapshot extends API {

  static Url = (
    process.env.GATSBY_SNAPSHOT_API ||
    process.env.REACT_APP_SNAPSHOT_API ||
    process.env.STORYBOOK_SNAPSHOT_API ||
    process.env.SNAPSHOT_API ||
    'https://hub.snapshot.page/'
  )

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
    return this.fetch<SnapshotResult>(
      '/api/message',
      this.options()
        .method('POST')
        .json({ address, msg, sig })
    )
  }

  async getStatus() {
    return this.fetch<SnapshotStatus>('/api/')
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

    const result = await this.fetch<SnapshotQueryResponse<{ space: SnapshotSpace }>>(`/graphql`, this.options()
      .method('POST')
      .json({ query, variables: { space } })
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
      type: "proposal",
      timestamp: Time.from().getTime().toString().slice(0, -3),
      payload: {
        ...payload,
        start: Number(payload.start.getTime().toString().slice(0, -3)),
        end: Number(payload.end.getTime().toString().slice(0, -3)),
        metadata: { network, strategies }
      }
    }

    return JSON.stringify(msg)
  }

  async removeProposalMessage(space: string, proposal: string) {
    const status = await this.getStatus()

    const msg: SnapshotRemoveProposalMessage = {
      space,
      type: "delete-proposal",
      version: status.version,
      timestamp: Time.from().getTime().toString().slice(0, -3),
      payload: { proposal }
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
      const result = await this.fetch<SnapshotVoteResponse>(`/graphql`, this.options()
        .method('POST')
        .json({ query, variables: { space, proposal, skip, first } })
      )

      const currentVotes = result?.data?.votes || []
      votes = [
        ...votes,
        ...currentVotes,
      ]

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
      type: "vote",
      version: status.version,
      timestamp: Time.from().getTime().toString().slice(0, -3),
      payload: { proposal, choice, metadata: {} }
    }

    return JSON.stringify(msg)
  }
}