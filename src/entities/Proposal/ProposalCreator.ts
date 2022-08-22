import { Block, JsonRpcProvider, getNetwork } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import Catalyst, { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { v1 as uuid } from 'uuid'

import { DiscourseClient, DiscoursePost } from '../../api/DiscourseClient'
import { HashContent, IPFS } from '../../api/IPFS'
import { Snapshot, SnapshotResult, SnapshotSpace, SnapshotStatus } from '../../api/Snapshot'
import CoauthorModel from '../Coauthor/model'
import isCommitee from '../Committee/isCommittee'
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY } from '../Discourse/utils'
import { SNAPSHOT_ADDRESS, SNAPSHOT_SPACE } from '../Snapshot/constants'
import { signMessage } from '../Snapshot/utils'
import VotesModel from '../Votes/model'

import ProposalModel from './model'
import { inBackground } from './routes'
import * as templates from './templates'
import { ProposalAttributes, ProposalStatus } from './types'
import { forumUrl, proposalUrl, snapshotProposalUrl } from './utils'

const SNAPSHOT_PRIVATE_KEY = requiredEnv('SNAPSHOT_PRIVATE_KEY')
const SNAPSHOT_ACCOUNT = new Wallet(SNAPSHOT_PRIVATE_KEY)

export class ProposalCreator {
  async createProposal(
    data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'>
  ) {
    const id = uuid()
    const start: Time.Dayjs = Time.utc().set('seconds', 0)
    const end = data.finish_at
    const proposal_url = proposalUrl({ id })
    const coAuthors =
      data.configuration && data.configuration.coAuthors ? (data.configuration.coAuthors as string[]) : null

    if (coAuthors) {
      delete data.configuration.coAuthors
    }

    const title = templates.title({ type: data.type, configuration: data.configuration })
    const description = await templates.description({ type: data.type, configuration: data.configuration })
    const profile = await ProposalCreator.getProfile(data)

    //
    // Create proposal payload
    //
    const { snapshotStatus, snapshotSpace } = await ProposalCreator.getSnapshotStatusAndSpace()
    const block = await ProposalCreator.getBlockNumber(snapshotSpace)
    const msg = await ProposalCreator.createSnapshotProposalMessage(
      data,
      profile,
      proposal_url,
      snapshotStatus,
      snapshotSpace,
      block,
      end,
      start
    )

    //
    // Create proposal in Snapshot
    //
    let snapshotProposal: SnapshotResult
    try {
      const sig = await signMessage(SNAPSHOT_ACCOUNT, msg)
      logger.log('Creating proposal in snapshot', { signed: sig, message: msg })
      snapshotProposal = await Snapshot.get().send(SNAPSHOT_ADDRESS, msg, sig)
    } catch (err) {
      throw new RequestError("Couldn't create proposal in snapshot", RequestError.InternalServerError, err as Error)
    }

    const snapshot_url = snapshotProposalUrl({ snapshot_space: SNAPSHOT_SPACE, snapshot_id: snapshotProposal.ipfsHash })
    logger.log('Snapshot proposal created', {
      snapshot_url: snapshot_url,
      snapshot_proposal: JSON.stringify(snapshotProposal),
    })

    const snapshotContent = await this.getSnapshotContent(snapshotProposal)

    const discourseProposal = await this.createProposalInDiscourse(
      data,
      profile,
      proposal_url,
      snapshot_url,
      snapshotProposal
    )

    const newProposal = await this.createProposalInDb(
      data,
      id,
      title,
      description,
      snapshotProposal,
      snapshotContent,
      snapshotSpace,
      discourseProposal,
      start,
      end,
      coAuthors
    )

    return ProposalModel.parse(newProposal)
  }

  async removeProposal(proposal: ProposalAttributes, user: string, updated_at: Date, id: string) {
    const allowToRemove = proposal.user === user || isCommitee(user)
    if (!allowToRemove) {
      throw new RequestError('Forbidden', RequestError.Forbidden)
    }

    await ProposalModel.update<ProposalAttributes>(
      {
        deleted: true,
        deleted_by: user,
        updated_at,
        status: ProposalStatus.Deleted,
      },
      {
        id,
      }
    )
    this.dropDiscourseTopic(proposal.discourse_topic_id)
    this.dropSnapshotProposal(proposal.snapshot_space, proposal.snapshot_id)
    return true
  }

  private async createProposalInDb(
    data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'>,
    id: string,
    title: string,
    description: string,
    snapshotProposal: SnapshotResult,
    snapshotContent: HashContent,
    snapshotSpace: SnapshotSpace,
    discourseProposal: DiscoursePost,
    start: Time.Dayjs,
    end: Date,
    coAuthors: string[] | null
  ) {
    const newProposal: ProposalAttributes = {
      ...data,
      id,
      title,
      description,
      configuration: JSON.stringify(data.configuration),
      status: ProposalStatus.Active,
      snapshot_id: snapshotProposal.ipfsHash,
      snapshot_space: SNAPSHOT_SPACE,
      snapshot_proposal: JSON.stringify(JSON.parse(snapshotContent.msg).payload),
      snapshot_signature: snapshotContent.sig,
      snapshot_network: snapshotSpace.network,
      discourse_id: discourseProposal.id,
      discourse_topic_id: discourseProposal.topic_id,
      discourse_topic_slug: discourseProposal.topic_slug,
      start_at: start.toJSON() as any,
      finish_at: end.toJSON() as any,
      deleted: false,
      deleted_by: null,
      enacted: false,
      enacted_by: null,
      enacted_description: null,
      enacting_tx: null,
      vesting_address: null,
      passed_by: null,
      passed_description: null,
      rejected_by: null,
      rejected_description: null,
      created_at: start.toJSON() as any,
      updated_at: start.toJSON() as any,
      textsearch: ProposalModel.textsearch(title, description, data.user, null),
    }

    try {
      await ProposalModel.create(newProposal)
      await VotesModel.createEmpty(id)
      if (coAuthors) {
        await CoauthorModel.createMultiple(id, coAuthors)
      }
    } catch (err) {
      this.dropDiscourseTopic(discourseProposal.topic_id)
      this.dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
      throw err
    }
    return newProposal
  }

  private static async getProfile(
    data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'>
  ) {
    try {
      return await Catalyst.get().getProfile(data.user)
    } catch (err) {
      throw new RequestError(`Error getting profile "${data.user}"`, RequestError.InternalServerError, err as Error)
    }
  }

  private async getSnapshotContent(snapshotProposal: SnapshotResult) {
    try {
      return await IPFS.get().getHash(snapshotProposal.ipfsHash)
    } catch (err) {
      this.dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
      throw new RequestError("Couldn't retrieve proposal from the IPFS", RequestError.InternalServerError, err as Error)
    }
  }

  private async createProposalInDiscourse(
    data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'>,
    profile: Avatar | null,
    proposal_url: string,
    snapshot_url: string,
    snapshotProposal: SnapshotResult
  ) {
    //
    // Create proposal in Discourse
    //
    let discourseProposal: DiscoursePost
    try {
      const discourseTemplateProps: templates.ForumTemplateProps = {
        type: data.type,
        configuration: data.configuration,
        user: data.user,
        profile,
        proposal_url,
        snapshot_url,
        snapshot_id: snapshotProposal.ipfsHash,
      }

      discourseProposal = await DiscourseClient.get().createPost(
        {
          category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
          title: templates.forumTitle(discourseTemplateProps),
          raw: await templates.forumDescription(discourseTemplateProps),
        },
        DISCOURSE_AUTH
      )
    } catch (error: any) {
      this.dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
      throw new RequestError(`Forum error: ${error.body.errors.join(', ')}`, RequestError.InternalServerError, error)
    }

    logger.log('Discourse proposal created', {
      forum_url: forumUrl({
        discourse_topic_slug: discourseProposal.topic_slug,
        discourse_topic_id: discourseProposal.topic_id,
      }),
      discourse_proposal: JSON.stringify(discourseProposal),
    })
    return discourseProposal
  }

  private static async createSnapshotProposalMessage(
    data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'>,
    profile: Avatar | null,
    proposal_url: string,
    snapshotStatus: SnapshotStatus,
    snapshotSpace: SnapshotSpace,
    block: Block,
    end: Pick<Date, 'getTime'>,
    start: Pick<Date, 'getTime'>
  ) {
    try {
      const snapshotTemplateProps: templates.SnapshotTemplateProps = {
        user: data.user,
        type: data.type,
        configuration: data.configuration,
        profile,
        proposal_url,
      }

      return await Snapshot.get().createProposalMessage(
        SNAPSHOT_SPACE,
        snapshotStatus.version,
        snapshotSpace.network,
        snapshotSpace.strategies,
        {
          name: templates.snapshotTitle(snapshotTemplateProps),
          body: await templates.snapshotDescription(snapshotTemplateProps),
          choices: data.configuration.choices,
          snapshot: block.number,
          end,
          start,
        }
      )
    } catch (err) {
      throw new RequestError('Error creating the snapshot message', RequestError.InternalServerError, err as Error)
    }
  }

  private static async getSnapshotStatusAndSpace() {
    let snapshotStatus: SnapshotStatus
    let snapshotSpace: SnapshotSpace
    try {
      const values = await Promise.all([
        await Snapshot.get().getStatus(),
        await Snapshot.get().getSpace(SNAPSHOT_SPACE),
      ])
      snapshotStatus = values[0]
      snapshotSpace = values[1]
      if (!snapshotSpace) {
        throw new Error(`Couldn't find snapshot space ${SNAPSHOT_SPACE}. Snapshot status: ${snapshotStatus}`)
      }
    } catch (err) {
      throw new RequestError(
        `Error getting snapshot space "${SNAPSHOT_SPACE}"`,
        RequestError.InternalServerError,
        err as Error
      )
    }
    return { snapshotStatus, snapshotSpace }
  }

  private static async getBlockNumber(snapshotSpace: SnapshotSpace) {
    try {
      console.log('snapshotSpace', snapshotSpace)
      const network = getNetwork(Number(snapshotSpace.network))
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

  dropDiscourseTopic(topic_id: number) {
    inBackground(() => {
      logger.log('Dropping discourse topic', { topic_id: topic_id })
      return DiscourseClient.get().removeTopic(topic_id, DISCOURSE_AUTH)
    })
  }

  dropSnapshotProposal(proposal_space: string, proposal_id: string) {
    inBackground(async () => {
      logger.log(`Dropping snapshot proposal: ${proposal_space}/${proposal_id}`)
      const address = SNAPSHOT_ADDRESS
      const msg = await Snapshot.get().removeProposalMessage(proposal_space, proposal_id)
      const sig = await signMessage(SNAPSHOT_ACCOUNT, msg)
      const result = await Snapshot.get().send(address, msg, sig)
      return {
        msg: JSON.parse(msg),
        sig,
        address,
        result,
      }
    })
  }
}
