import { Block } from '@ethersproject/providers'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'

import { IPFS } from '../clients/IPFS'
import { SnapshotApi, SnapshotReceipt } from '../clients/SnapshotApi'
import { inBackground } from '../entities/Proposal/routes'
import * as templates from '../entities/Proposal/templates'
import { proposalUrl, snapshotProposalUrl } from '../entities/Proposal/utils'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

import DclRpcService from './DclRpcService'
import { ProposalInCreation, ProposalLifespan } from './ProposalService'

export class SnapshotService {
  static async createProposal(
    proposalInCreation: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    proposalLifespan: ProposalLifespan
  ) {
    const block: Block = await DclRpcService.getBlockNumber()
    const { proposalTitle, proposalBody } = await this.snapshotTitleAndBody(proposalInCreation, profile, proposalId)

    const proposalCreationReceipt: SnapshotReceipt = await SnapshotApi.get().createProposal(
      proposalInCreation,
      proposalTitle,
      proposalBody,
      proposalLifespan,
      block.number
    )

    const snapshot_url = snapshotProposalUrl({
      snapshot_space: SNAPSHOT_SPACE,
      snapshot_id: proposalCreationReceipt.id,
    })

    logger.log('Snapshot proposal created', {
      snapshot_url: snapshot_url,
      snapshot_proposal: JSON.stringify(proposalCreationReceipt),
    })

    const snapshotContent = await this.getIpfsSnapshotContent(proposalCreationReceipt)
    return { snapshotId: proposalCreationReceipt.id, snapshot_url, snapshotContent }
  }

  private static async snapshotTitleAndBody(
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

  private static async getIpfsSnapshotContent(proposalCreationReceipt: SnapshotReceipt) {
    try {
      return await IPFS.get().getHash(proposalCreationReceipt.ipfs)
    } catch (err: any) {
      SnapshotService.dropSnapshotProposal(proposalCreationReceipt.id)
      throw new Error("Couldn't retrieve proposal from the IPFS: " + err.message, err)
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
}
