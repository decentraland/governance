import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { v1 as uuid } from 'uuid'

import { DiscoursePost } from '../../api/DiscourseClient'
import { HashContent } from '../../api/IPFS'
import { getEnvironmentChainId } from '../../modules/votes/utils'
import CatalystService from '../../services/CatalystService'
import { DiscourseService } from '../../services/DiscourseService'
import CoauthorModel from '../Coauthor/model'
import isCommittee from '../Committee/isCommittee'
import { SNAPSHOT_SPACE } from '../Snapshot/constants'
import VotesModel from '../Votes/model'

import { SnapshotProposalCreator } from './SnapshotProposalCreator'
import ProposalModel from './model'
import * as templates from './templates'
import { ProposalAttributes, ProposalStatus } from './types'

export type ProposalInCreation = Pick<
  ProposalAttributes,
  'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'
>

export type ProposalLifespan = {
  start: Time.Dayjs
  end: Date
}

export class ProposalCreator {
  static async createProposal(proposalInCreation: ProposalInCreation) {
    const proposalId = uuid()
    const proposalLifespan = this.getLifespan(proposalInCreation)
    const coAuthors = this.getCoAuthors(proposalInCreation)

    if (coAuthors) {
      delete proposalInCreation.configuration.coAuthors
    }

    const profile = await CatalystService.getProfile(proposalInCreation.user)

    const { snapshotId, snapshot_url, snapshotContent } = await SnapshotProposalCreator.createProposalInSnapshot(
      proposalInCreation,
      proposalId,
      profile,
      proposalLifespan
    )

    const discourseProposal = await DiscourseService.createProposalInDiscourse(
      proposalInCreation,
      proposalId,
      profile,
      snapshot_url,
      snapshotId
    )

    const title = templates.title({ type: proposalInCreation.type, configuration: proposalInCreation.configuration })
    const description = await templates.description({
      type: proposalInCreation.type,
      configuration: proposalInCreation.configuration,
    })

    const newProposal = await ProposalCreator.createProposalInDb(
      proposalInCreation,
      proposalId,
      title,
      description,
      snapshotId,
      snapshotContent,
      discourseProposal,
      proposalLifespan,
      coAuthors
    )

    return ProposalModel.parse(newProposal)
  }

  private static getCoAuthors(proposalInCreation: ProposalInCreation) {
    return proposalInCreation.configuration && proposalInCreation.configuration.coAuthors
      ? (proposalInCreation.configuration.coAuthors as string[])
      : null
  }

  private static getLifespan(proposalInCreation: ProposalInCreation): ProposalLifespan {
    const start: Time.Dayjs = Time.utc().set('seconds', 0)
    const end = proposalInCreation.finish_at
    return { start, end }
  }

  static async removeProposal(proposal: ProposalAttributes, user: string, updated_at: Date, id: string) {
    this.validateRemoval(proposal, user)
    await this.markAsDeleted(user, updated_at, id)
    DiscourseService.dropDiscourseTopic(proposal.discourse_topic_id)
    SnapshotProposalCreator.dropSnapshotProposal(proposal.snapshot_id)
    return true
  }

  private static async markAsDeleted(user: string, updated_at: Date, id: string) {
    await ProposalModel.update<ProposalAttributes>(
      {
        deleted: true,
        deleted_by: user,
        updated_at,
        status: ProposalStatus.Deleted,
      },
      { id }
    )
  }

  private static validateRemoval(proposal: ProposalAttributes, user: string) {
    const allowToRemove = proposal.user === user || isCommittee(user)
    if (!allowToRemove) {
      throw new RequestError('Forbidden', RequestError.Forbidden)
    }
  }

  private static async createProposalInDb(
    data: ProposalInCreation,
    id: string,
    title: string,
    description: string,
    snapshotId: string,
    snapshotContent: HashContent,
    discourseProposal: DiscoursePost,
    proposalLifespan: ProposalLifespan,
    coAuthors: string[] | null
  ) {
    const newProposal: ProposalAttributes = {
      ...data,
      id,
      title,
      description,
      configuration: JSON.stringify(data.configuration),
      status: ProposalStatus.Active,
      snapshot_id: snapshotId,
      snapshot_space: SNAPSHOT_SPACE,
      snapshot_proposal: JSON.stringify(snapshotContent.data.message),
      snapshot_signature: snapshotContent.sig,
      snapshot_network: String(Number(getEnvironmentChainId())),
      discourse_id: discourseProposal.id,
      discourse_topic_id: discourseProposal.topic_id,
      discourse_topic_slug: discourseProposal.topic_slug,
      start_at: proposalLifespan.start.toJSON() as any,
      finish_at: proposalLifespan.end.toJSON() as any,
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
      created_at: proposalLifespan.start.toJSON() as any,
      updated_at: proposalLifespan.start.toJSON() as any,
      textsearch: ProposalModel.textsearch(title, description, data.user, null),
    }

    try {
      await ProposalModel.create(newProposal)
      await VotesModel.createEmpty(id)
      if (coAuthors) {
        await CoauthorModel.createMultiple(id, coAuthors)
      }
    } catch (err) {
      DiscourseService.dropDiscourseTopic(discourseProposal.topic_id)
      SnapshotProposalCreator.dropSnapshotProposal(snapshotId)
      throw err
    }
    return newProposal
  }
}
