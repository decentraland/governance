import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import snapshot from '@snapshot-labs/snapshot.js'
import Client from '@snapshot-labs/snapshot.js/dist/sign'
import { CancelProposal, Proposal, ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'

import { SNAPSHOT_ADDRESS, SNAPSHOT_PRIVATE_KEY, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { getEnvironmentChainId } from '../modules/votes/utils'
import { ProposalInCreation, ProposalLifespan } from '../services/ProposalService'

import { SnapshotGraphql } from './SnapshotGraphql'
import { trimLastForwardSlash } from './utils'

const SNAPSHOT_PROPOSAL_TYPE: ProposalType = 'single-choice' // Each voter may select only one choice
const SNAPSHOT_APP_NAME = 'decentraland-governance'

export type SnapshotReceipt = {
  id: string
  ipfs: string
  relayer: {
    address: string
    receipt: string
  }
}

export class SnapshotApi {
  static Url = process.env.GATSBY_SNAPSHOT_API || 'https://hub.snapshot.org'

  static Cache = new Map<string, SnapshotApi>()
  private readonly client: Client
  private readonly spaceName: string
  private readonly address: string
  private readonly account: Wallet

  static from(baseUrl: string) {
    baseUrl = trimLastForwardSlash(baseUrl)
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  constructor(baseUrl: string) {
    this.client = new snapshot.Client712(baseUrl)
    this.account = SnapshotApi.getWallet()
    this.spaceName = SnapshotApi.getSpace()
    this.address = SnapshotApi.getSnapshotAddress()
  }

  private static getWallet() {
    if (!SNAPSHOT_PRIVATE_KEY) {
      throw new Error('Failed to determine snapshot private key. Please check SNAPSHOT_PRIVATE_KEY env is defined')
    }
    return new Wallet(SNAPSHOT_PRIVATE_KEY)
  }

  private static getSpace() {
    if (!SNAPSHOT_SPACE) {
      throw new Error('Failed to determine snapshot space. Please check GATSBY_SNAPSHOT_SPACE env is defined')
    }
    return SNAPSHOT_SPACE
  }

  private static getSnapshotAddress() {
    if (!SNAPSHOT_ADDRESS) {
      throw new Error('Failed to determine snapshot address. Please check GATSBY_SNAPSHOT_ADDRESS env is defined')
    }
    return SNAPSHOT_ADDRESS
  }

  static get() {
    return this.from(env('SNAPSHOT_API', this.Url))
  }

  async createProposal(
    proposal: ProposalInCreation,
    proposalTitle: string,
    proposalBody: string,
    proposalLifespan: ProposalLifespan,
    blockNumber: number
  ): Promise<SnapshotReceipt> {
    const proposalMessage = await this.createProposalMessage(
      proposal,
      proposalTitle,
      proposalBody,
      proposalLifespan,
      blockNumber
    )
    return (await this.client.proposal(this.account, this.address, proposalMessage)) as SnapshotReceipt
  }

  private async createProposalMessage(
    proposal: ProposalInCreation,
    proposalTitle: string,
    proposalBody: string,
    proposalLifespan: ProposalLifespan,
    blockNumber: number
  ) {
    let snapshotProposal: Proposal
    try {
      snapshotProposal = {
        space: this.spaceName,
        type: SNAPSHOT_PROPOSAL_TYPE,
        title: proposalTitle,
        body: proposalBody,
        choices: proposal.configuration.choices as string[],
        start: SnapshotApi.toSnapshotTimestamp(proposalLifespan.start.getTime()),
        end: SnapshotApi.toSnapshotTimestamp(proposalLifespan.end.getTime()),
        snapshot: blockNumber,
        plugins: JSON.stringify({}),
        app: SNAPSHOT_APP_NAME,
        discussion: '',
      }
    } catch (err) {
      throw new Error('Error building the proposal creation message', err as Error)
    }

    return snapshotProposal
  }

  public async removeProposal(snapshotId: string) {
    const cancelProposalMessage: CancelProposal = {
      space: this.spaceName,
      timestamp: SnapshotApi.toSnapshotTimestamp(Time.from().getTime()),
      proposal: snapshotId,
    }
    return (await this.client.cancelProposal(this.account, this.address, cancelProposalMessage)) as SnapshotReceipt
  }

  async castVote(
    account: Web3Provider | Wallet,
    address: string,
    proposalSnapshotId: string,
    choiceNumber: number
  ): Promise<SnapshotReceipt> {
    const voteMessage = {
      space: this.spaceName,
      proposal: proposalSnapshotId,
      type: SNAPSHOT_PROPOSAL_TYPE,
      choice: choiceNumber,
      app: SNAPSHOT_APP_NAME,
    }
    return (await this.client.vote(account, address, voteMessage)) as SnapshotReceipt
  }

  async getScores(addresses: string[], blockNumber?: number | string) {
    const formattedAddresses = addresses.map((addr) => addr.toLowerCase())
    const snapshotSpace = await SnapshotGraphql.get().getSpace(this.spaceName)
    const network = getEnvironmentChainId()

    return {
      scores: await snapshot.utils.getScores(
        this.spaceName,
        snapshotSpace.strategies,
        network.toString(),
        formattedAddresses,
        blockNumber
      ),
      strategies: snapshotSpace.strategies,
    }
  }

  private static toSnapshotTimestamp(time: number) {
    return Number(time.toString().slice(0, -3))
  }
}
