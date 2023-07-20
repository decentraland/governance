import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { SnapshotApi, SnapshotReceipt } from '../clients/SnapshotApi'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import * as templates from '../entities/Proposal/templates'
import { proposalUrl, snapshotProposalUrl } from '../entities/Proposal/utils'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { inBackground } from '../helpers'
import { Avatar } from '../utils/Catalyst/types'

import DclRpcService from './DclRpcService'
import { ProposalInCreation, ProposalLifespan } from './ProposalService'

export class SnapshotService {
  static async createProposal(
    proposalInCreation: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    proposalLifespan: ProposalLifespan
  ) {
    const blockNumber: number = await DclRpcService.getBlockNumber()
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
    profile: Avatar | null,
    proposalId: string
  ) {
    const snapshotTemplateProps: templates.SnapshotTemplateProps = {
      user: proposalInCreation.user,
      type: proposalInCreation.type,
      configuration: proposalInCreation.configuration,
      profile,
      proposal_url: proposalUrl({ id: proposalId }),
    }

    const proposalTitle = templates.snapshotTitle(snapshotTemplateProps)
    const proposalBody = await templates.snapshotDescription(snapshotTemplateProps)
    return { proposalTitle, proposalBody }
  }

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

  static async getSnapshotStatusAndSpace(spaceName?: string) {
    spaceName = spaceName && spaceName.length > 0 ? spaceName : SNAPSHOT_SPACE
    const values = await Promise.all([
      await SnapshotGraphql.get().getStatus(),
      await SnapshotGraphql.get().getSpace(spaceName),
    ])
    const snapshotStatus = values[0]
    const snapshotSpace = values[1]
    if (!snapshotSpace) {
      throw new Error(`Couldn't find snapshot space ${spaceName}. 
      \nSnapshot response: ${JSON.stringify(snapshotSpace)}
      \nSnapshot status: ${JSON.stringify(snapshotStatus)}`)
    }
    return { snapshotStatus, snapshotSpace }
  }
}
