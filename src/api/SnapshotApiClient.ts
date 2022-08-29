import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import snapshot from '@snapshot-labs/snapshot.js'
import Client from '@snapshot-labs/snapshot.js/dist/sign'
import { CancelProposal, Proposal, ProposalType } from '@snapshot-labs/snapshot.js/dist/sign/types'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'

import { ProposalInCreation, ProposalLifespan } from '../entities/Proposal/ProposalCreator'
import { SNAPSHOT_ADDRESS } from '../entities/Snapshot/constants'
import { getEnvironmentChainId } from '../modules/votes/utils'

import { SnapshotGraphqlClient } from './SnapshotGraphqlClient'

const SNAPSHOT_PROPOSAL_TYPE: ProposalType = 'single-choice' // Each voter may select only one choice
const GOVERNANCE_SNAPSHOT_NAME = 'decentraland-governance'

export type SnapshotReceipt = {
  id: string
  ipfs: string
  relayer: {
    address: string
    receipt: string
  }
}

export class SnapshotApiClient {
  static Url =
    process.env.GATSBY_SNAPSHOT_API ||
    process.env.REACT_APP_SNAPSHOT_API ||
    process.env.STORYBOOK_SNAPSHOT_API ||
    process.env.SNAPSHOT_API ||
    'https://hub.snapshot.org/'

  static Cache = new Map<string, SnapshotApiClient>()
  private readonly client: Client
  private readonly spaceName: string
  private readonly address: string
  private readonly account: Wallet

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  constructor(baseUrl: string) {
    this.client = new snapshot.Client712(baseUrl)
    this.account = SnapshotApiClient.getWallet()
    this.spaceName = SnapshotApiClient.getSpace()
    this.address = SnapshotApiClient.getSnapshotAddress()
  }

  private static getWallet() {
    if (!process.env.SNAPSHOT_PRIVATE_KEY) {
      throw new Error('Failed to determine snapshot private key. Please check SNAPSHOT_PRIVATE_KEY env is defined')
    }
    return new Wallet(process.env.SNAPSHOT_PRIVATE_KEY)
  }

  private static getSpace() {
    if (!process.env.GATSBY_SNAPSHOT_SPACE) {
      throw new Error('Failed to determine snapshot space. Please check GATSBY_SNAPSHOT_SPACE env is defined')
    }
    return process.env.GATSBY_SNAPSHOT_SPACE
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
    console.log('Creating Proposal', proposalMessage)
    let receipt
    try {
      receipt = await this.client.proposal(this.account, this.address, proposalMessage)
    } catch (e) {
      console.log('Creation error', e)
      throw e
    }
    console.log('Receipt', receipt)
    return receipt as SnapshotReceipt
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
        start: SnapshotApiClient.toSnapshotTimestamp(proposalLifespan.start.getTime()),
        end: SnapshotApiClient.toSnapshotTimestamp(proposalLifespan.end.getTime()),
        snapshot: blockNumber,
        plugins: JSON.stringify({}),
        app: GOVERNANCE_SNAPSHOT_NAME,
        discussion: '',
      }
    } catch (err) {
      throw new RequestError(
        'Error building the proposal creation message',
        RequestError.InternalServerError,
        err as Error
      )
    }

    return snapshotProposal
  }

  public async removeProposal(snapshotId: string) {
    const cancelProposalMessage: CancelProposal = {
      space: this.spaceName,
      timestamp: SnapshotApiClient.toSnapshotTimestamp(Time.from().getTime()),
      proposal: snapshotId,
    }
    console.log('Removing Proposal', cancelProposalMessage)
    const receipt = await this.client.cancelProposal(this.account, this.address, cancelProposalMessage)
    console.log('Receipt', receipt)
    return receipt as SnapshotReceipt
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
      app: GOVERNANCE_SNAPSHOT_NAME,
    }
    console.log('Casting Vote', voteMessage)
    const receipt = await this.client.vote(account, address, voteMessage)
    console.log('Receipt', receipt)
    return receipt as SnapshotReceipt
  }

  async getScores(addresses: string[], blockNumber?: number | string) {
    addresses = addresses.map((addr) => addr.toLowerCase())
    const snapshotSpace = await SnapshotGraphqlClient.get().getSpace(this.spaceName)
    const network = getEnvironmentChainId()

    return {
      scores: await snapshot.utils.getScores(
        this.spaceName,
        snapshotSpace.strategies,
        network.toString(),
        addresses,
        blockNumber
      ),
      strategies: snapshotSpace.strategies,
    }
  }

  private static toSnapshotTimestamp(time: number) {
    return Number(time.toString().slice(0, -3))
  }
}
