import { Web3Provider } from '@ethersproject/providers'
import snapshot from '@snapshot-labs/snapshot.js'
import Client from '@snapshot-labs/snapshot.js/dist/sign'
import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import env from 'decentraland-gatsby/dist/utils/env'

import * as templates from '../entities/Proposal/templates'
import { ProposalAttributes } from '../entities/Proposal/types'
import { proposalUrl } from '../entities/Proposal/utils'

const SNAPSHOT_PROPOSAL_TYPE = 'single-choice' // Each voter may select only one choice
const GOVERNANCE_SNAPSHOT_NAME = 'DecentralandGovernance'

export class SnapshotClient {
  static Url =
    process.env.GATSBY_SNAPSHOT_API ||
    process.env.REACT_APP_SNAPSHOT_API ||
    process.env.STORYBOOK_SNAPSHOT_API ||
    process.env.SNAPSHOT_API ||
    'https://hub.snapshot.org/'

  static Cache = new Map<string, SnapshotClient>()
  private client: Client
  private space: string

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  constructor(baseUrl: string) {
    this.client = new snapshot.Client712(baseUrl)
    if (!process.env.GATSBY_SNAPSHOT_SPACE) {
      throw new Error('Failed to determine snapshot space. Please check GATSBY_SNAPSHOT_SPACE env is defined')
    }
    this.space = process.env.GATSBY_SNAPSHOT_SPACE
  }

  static get() {
    return this.from(env('SNAPSHOT_API', this.Url))
  }

  async castVote(web3: Web3Provider, account: string, proposalSnapshotId: string, choiceNumber: number) {
    console.log('#CastingVote')
    console.log('proposalSnapshotId', proposalSnapshotId)
    console.log('choiceNumber', choiceNumber)
    console.log('account', account)
    console.log('this.space', this.space)
    console.log('GOVERNANCE_SNAPSHOT_NAME', GOVERNANCE_SNAPSHOT_NAME)
    //TODO: validations
    const receipt = await this.client.vote(web3, account, {
      space: this.space,
      proposal: proposalSnapshotId,
      type: SNAPSHOT_PROPOSAL_TYPE,
      choice: choiceNumber,
      app: GOVERNANCE_SNAPSHOT_NAME,
    })
    console.log('Receipt', receipt)
  }

  async createProposal(web3: Web3Provider, account: string, proposalMessage: Proposal) {
    console.log('#CreatingProposal')
    console.log('proposalMessage', proposalMessage)
    //TODO: validations
    const receipt = await this.client.proposal(web3, account, proposalMessage)
    console.log('Receipt', receipt)
  }

  async createProposalMessage(
    proposal: ProposalAttributes,
    profile: Avatar,
    start: Pick<Date, 'getTime'>,
    end: Pick<Date, 'getTime'>,
    blockNumber: number
  ) {
    let msg: Proposal
    try {
      const snapshotTemplateProps: templates.SnapshotTemplateProps = {
        user: proposal.user,
        type: proposal.type,
        configuration: proposal.configuration,
        profile,
        proposal_url: proposalUrl({ id: proposal.id }),
      }

      msg = {
        space: this.space,
        type: SNAPSHOT_PROPOSAL_TYPE,
        title: templates.snapshotTitle(snapshotTemplateProps),
        body: await templates.snapshotDescription(snapshotTemplateProps),
        choices: proposal.configuration.choices,
        start: Number(start.getTime().toString().slice(0, -3)),
        end: Number(end.getTime().toString().slice(0, -3)),
        snapshot: blockNumber,
        plugins: JSON.stringify({}),
        app: GOVERNANCE_SNAPSHOT_NAME,
        discussion: '', //TODO: dafuq is this
      }
    } catch (err) {
      throw new RequestError('Error creating the snapshot message', RequestError.InternalServerError, err as Error)
    }

    return JSON.stringify(msg)
  }
}
