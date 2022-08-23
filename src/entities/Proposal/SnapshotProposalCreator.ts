import { Block, JsonRpcProvider, getNetwork } from '@ethersproject/providers'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'

import { IPFS } from '../../api/IPFS'
import { ProposalCreationReceipt, SnapshotClient } from '../../api/SnapshotClient'
import { getEnvironmentChainId } from '../../modules/votes/utils'
import { SNAPSHOT_SPACE } from '../Snapshot/constants'

import { ProposalInCreation, ProposalLifespan } from './ProposalCreator'
import { inBackground } from './routes'
import * as templates from './templates'
import { proposalUrl, snapshotProposalUrl } from './utils'

export class SnapshotProposalCreator {
  static async createProposalInSnapshot(
    proposalInCreation: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    proposalLifespan: ProposalLifespan
  ) {
    const block: Block = await SnapshotProposalCreator.getBlockNumber()
    const { proposalTitle, proposalBody } = await this.snapshotTitleAndBody(proposalInCreation, profile, proposalId)

    const proposalCreationReceipt: ProposalCreationReceipt = await SnapshotClient.get().createProposal(
      proposalInCreation,
      proposalTitle,
      proposalBody,
      proposalLifespan,
      block.number
    )

    const snapshot_url = snapshotProposalUrl({
      snapshot_space: SNAPSHOT_SPACE,
      snapshot_id: proposalCreationReceipt.ipfs,
    })

    logger.log('Snapshot proposal created', {
      snapshot_url: snapshot_url,
      snapshot_proposal: JSON.stringify(proposalCreationReceipt),
    })

    const snapshotContent = await this.getSnapshotContent(proposalCreationReceipt.ipfs)
    return { ipfsHash: proposalCreationReceipt.ipfs, snapshot_url, snapshotContent }
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
    const proposalBody = JSON.stringify(await templates.snapshotDescription(snapshotTemplateProps)) //TODO: check if this stringify is necessary
    return { proposalTitle, proposalBody }
  }

  private static async getBlockNumber() {
    try {
      const network = getNetwork(Number(getEnvironmentChainId()))
      console.log('network', network)
      const networkName = network.name === 'homestead' ? 'mainnet' : network.name
      console.log('networkName', networkName)
      const url = process.env.RPC_PROVIDER_URL + networkName
      const provider = new JsonRpcProvider(url)
      return await provider.getBlock('latest')
    } catch (err) {
      throw new RequestError("Couldn't get the latest block", RequestError.InternalServerError, err as Error)
    }
  }

  private static async getSnapshotContent(ipfsHash: string) {
    try {
      return await IPFS.get().getHash(ipfsHash)
    } catch (err) {
      SnapshotProposalCreator.dropSnapshotProposal(ipfsHash)
      throw new RequestError("Couldn't retrieve proposal from the IPFS", RequestError.InternalServerError, err as Error)
    }
  }

  static dropSnapshotProposal(ipfsHash: string) {
    inBackground(async () => {
      logger.log(`Dropping snapshot proposal: ${ipfsHash}`)
      const result = await SnapshotClient.get().removeProposal(ipfsHash)
      return {
        proposalIpfsHash: ipfsHash,
        result,
      }
    })
  }
}
