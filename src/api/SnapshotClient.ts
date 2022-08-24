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

const SNAPSHOT_PROPOSAL_TYPE: ProposalType = 'single-choice' // Each voter may select only one choice
const GOVERNANCE_SNAPSHOT_NAME = 'decentraland-governance'

export type ProposalCreationReceipt = {
  id: string
  ipfs: string
  relayer: {
    address: string
    receipt: string
  }
}

export class SnapshotClient {
  static Url =
    process.env.GATSBY_SNAPSHOT_API ||
    process.env.REACT_APP_SNAPSHOT_API ||
    process.env.STORYBOOK_SNAPSHOT_API ||
    process.env.SNAPSHOT_API ||
    'https://hub.snapshot.org/'

  static Cache = new Map<string, SnapshotClient>()
  private readonly client: Client
  private readonly space: string
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
    this.account = SnapshotClient.getWallet()
    this.space = SnapshotClient.getSpace()
    this.address = SnapshotClient.getSnapshotAddress()
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

  async castVote(account: Web3Provider | Wallet, address: string, proposalSnapshotId: string, choiceNumber: number) {
    console.log('#CastingVote')
    console.log('proposalSnapshotId', proposalSnapshotId)
    console.log('choiceNumber', choiceNumber)
    console.log('this.space', this.space)
    console.log('GOVERNANCE_SNAPSHOT_NAME', GOVERNANCE_SNAPSHOT_NAME)
    //TODO: validations
    const receipt = await this.client.vote(account, address, {
      space: this.space,
      proposal: proposalSnapshotId,
      type: SNAPSHOT_PROPOSAL_TYPE,
      choice: choiceNumber,
      app: GOVERNANCE_SNAPSHOT_NAME,
    })
    console.log('Receipt', receipt)
    return receipt
  }

  async createProposal(
    proposal: ProposalInCreation,
    proposalTitle: string,
    proposalBody: string,
    proposalLifespan: ProposalLifespan,
    blockNumber: number
  ): Promise<ProposalCreationReceipt> {
    //TODO: validations?
    console.log('#CreatingProposal')
    const proposalMessage = await this.createProposalMessage(
      proposal,
      proposalTitle,
      proposalBody,
      proposalLifespan,
      blockNumber
    )
    console.log('ProposalMessage', proposalMessage)
    const receipt = await this.client.proposal(this.account, this.address, proposalMessage)
    console.log('Receipt', receipt)
    return receipt as ProposalCreationReceipt
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
        space: this.space,
        type: SNAPSHOT_PROPOSAL_TYPE,
        title: proposalTitle,
        body: proposalBody,
        choices: proposal.configuration.choices as string[],
        start: SnapshotClient.toSnapshotTimestamp(proposalLifespan.start.getTime()),
        end: SnapshotClient.toSnapshotTimestamp(proposalLifespan.end.getTime()),
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
      space: this.space,
      timestamp: SnapshotClient.toSnapshotTimestamp(Time.from().getTime()),
      proposal: snapshotId,
    }

    const receipt = await this.client.cancelProposal(this.account, this.address, cancelProposalMessage)
    console.log('Receipt', receipt)
    return receipt //TODO as ProposalRemovalReceipt
  }

  private static toSnapshotTimestamp(time: number) {
    return Number(time.toString().slice(0, -3))
  }
}
