import isNumber from 'lodash/isNumber'

import { SnapshotApi, SnapshotReceipt } from '../clients/SnapshotApi'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { DetailedScores, SnapshotProposal, SnapshotVote, VpDistribution } from '../clients/SnapshotTypes'
import * as templates from '../entities/Proposal/templates'
import { proposalUrl, snapshotProposalUrl } from '../entities/Proposal/utils'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { isSameAddress } from '../entities/Snapshot/utils'
import { inBackground } from '../helpers'
import { DclProfile } from '../utils/Catalyst/types'
import logger from '../utils/logger'

import { ProposalInCreation, ProposalLifespan } from './ProposalService'
import RpcService from './RpcService'

const DELEGATION_STRATEGY_NAME = 'delegation'

export class SnapshotService {
  static async createProposal(
    proposalInCreation: ProposalInCreation,
    proposalId: string,
    profile: DclProfile | null,
    proposalLifespan: ProposalLifespan
  ) {
    const blockNumber: number = await RpcService.getBlockNumber()
    const { proposalTitle, proposalBody } = await this.getProposalTitleAndBody(proposalInCreation, profile, proposalId)

    const proposalCreationReceipt: SnapshotReceipt = await SnapshotApi.get().createProposal(
      proposalInCreation,
      proposalTitle,
      proposalBody,
      proposalLifespan,
      blockNumber
    )

    const snapshotId = proposalCreationReceipt.id
    const snapshotUrl = snapshotProposalUrl({
      snapshot_space: SNAPSHOT_SPACE,
      snapshot_id: snapshotId,
    })

    logger.log('Snapshot proposal created', {
      snapshot_url: snapshotUrl,
      snapshot_proposal: JSON.stringify(proposalCreationReceipt),
    })

    const snapshotContent = await this.getProposalContent(snapshotId)
    return { snapshotId, snapshotUrl, snapshotContent }
  }

  private static async getProposalTitleAndBody(
    proposalInCreation: ProposalInCreation,
    profile: DclProfile | null,
    proposalId: string
  ) {
    const snapshotTemplateProps: templates.SnapshotTemplateProps = {
      user: proposalInCreation.user,
      type: proposalInCreation.type,
      configuration: proposalInCreation.configuration,
      profile,
      proposal_url: proposalUrl(proposalId),
    }

    const proposalTitle = templates.snapshotTitle(snapshotTemplateProps)
    const proposalBody = await templates.snapshotDescription(snapshotTemplateProps)
    return { proposalTitle, proposalBody }
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private static async getProposalContent(snapshotId: string) {
    try {
      return await SnapshotGraphql.get().getProposalContent(snapshotId)
    } catch (err: any) {
      SnapshotService.dropSnapshotProposal(snapshotId)
      throw new Error("Couldn't retrieve proposal content: " + err.message, err)
    }
  }

  static dropSnapshotProposal(snapshotId: string) {
    inBackground(async () => {
      logger.log(`Dropping snapshot proposal: ${snapshotId}`)
      const result = await SnapshotApi.get().removeProposal(snapshotId)
      return {
        proposalId: snapshotId,
        result,
      }
    })
  }

  static async getConfig(spaceName = SNAPSHOT_SPACE) {
    const [config, space] = await Promise.all([
      await SnapshotGraphql.get().getConfig(),
      await SnapshotGraphql.get().getSpace(spaceName),
    ])
    if (!space) {
      throw new Error(`Couldn't find snapshot space ${spaceName}. 
      \nSnapshot response: ${JSON.stringify(space)}
      \nSnapshot config: ${JSON.stringify(config)}`)
    }
    return { config, space }
  }

  static async getVotesByAddresses(addresses: string[], first?: number, skip?: number) {
    if (isNumber(first) && isNumber(skip)) {
      return await SnapshotGraphql.get().getVotesByAddressesInBatches(addresses, first, skip)
    }
    return await SnapshotGraphql.get().getVotesByAddresses(addresses)
  }

  static async getVotesByProposal(proposalSnapshotId: string): Promise<SnapshotVote[]> {
    return await SnapshotGraphql.get().getVotesByProposal(proposalSnapshotId)
  }

  static async getVotesByDates(start: Date, end: Date): Promise<SnapshotVote[]> {
    return await SnapshotGraphql.get().getVotesByDates(start, end)
  }

  static async getProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    return await SnapshotGraphql.get().getProposals(start, end, fields)
  }

  static async getPendingProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[], limit: number) {
    return await SnapshotGraphql.get().getPendingProposals(start, end, fields, limit)
  }

  static async getVpDistribution(address: string, proposalSnapshotId?: string): Promise<VpDistribution> {
    return await SnapshotGraphql.get().getVpDistribution(address, proposalSnapshotId)
  }

  static async getScores(addresses: string[]) {
    const formattedAddresses = addresses.map((addr) => addr.toLowerCase())
    const { scores, strategies } = await SnapshotApi.get().getScores(formattedAddresses)

    const result: DetailedScores = {}
    const delegationScores = scores[strategies.findIndex((s) => s.name === DELEGATION_STRATEGY_NAME)] || {}
    for (const addr of formattedAddresses) {
      result[addr] = {
        ownVp: 0,
        delegatedVp:
          Math.round(delegationScores[Object.keys(delegationScores).find((key) => isSameAddress(key, addr)) || '']) ||
          0,
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

  static async getProposalScores(proposalSnapshotId: string): Promise<number[]> {
    return await SnapshotGraphql.get().getProposalScores(proposalSnapshotId)
  }
}
