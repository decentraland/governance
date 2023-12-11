import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { Discourse, DiscoursePost } from '../../clients/Discourse'
import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UpdateModel from '../../entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import { getCurrentUpdate, getNextPendingUpdate, getUpdateUrl } from '../../entities/Updates/utils'
import { inBackground } from '../../helpers'
import { DiscourseService } from '../../services/DiscourseService'

import { CoauthorService } from './coauthor'
import { DiscordService } from './discord'
import { EventsService } from './events'

export class UpdateService {
  static async getById(id: UpdateAttributes['id']) {
    return await UpdateModel.findOne<UpdateAttributes>({ id })
  }

  static async getAllByProposalId(proposal_id: ProposalAttributes['id']) {
    return await UpdateModel.find<UpdateAttributes>({ proposal_id })
  }

  static async updateWithDiscoursePost(id: UpdateAttributes['id'], discoursePost: DiscoursePost) {
    return await UpdateModel.update(
      { discourse_topic_id: discoursePost.topic_id, discourse_topic_slug: discoursePost.topic_slug },
      { id }
    )
  }

  static commentUpdateEditInDiscourse(update: UpdateAttributes) {
    inBackground(async () => {
      if (!update.discourse_topic_id) {
        logger.error('No discourse topic associated to this update', { id: update.id })
        return
      }

      await Discourse.get().commentOnPost({
        topic_id: update.discourse_topic_id,
        raw: `This project update has been edited by the author. Please check the latest version on the [Governance dApp](${getUpdateUrl(
          update.id,
          update.proposal_id
        )}).`,
        created_at: new Date().toJSON(),
      })
    })
  }

  static commentUpdateDeleteInDiscourse(update: UpdateAttributes) {
    inBackground(async () => {
      if (!update.discourse_topic_id) {
        logger.error('No discourse topic associated to this update', { id: update.id })
        return
      }

      await Discourse.get().commentOnPost({
        topic_id: update.discourse_topic_id,
        raw: `This project update has been deleted by the author.`,
        created_at: new Date().toJSON(),
      })
    })
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // TODO: refactor this to use the UpdateAttributes type
  static async create(
    proposalId: string,
    user: string,
    author: string,
    health: any,
    introduction: any,
    highlights: any,
    blockers: any,
    next_steps: any,
    additional_notes: any
  ) {
    const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: proposalId })
    const isAuthorOrCoauthor =
      user && (proposal?.user === user || (await CoauthorService.isCoauthor(proposalId, user))) && author === user

    if (!proposal || !isAuthorOrCoauthor) {
      throw new RequestError(`Unauthorized`, RequestError.Forbidden)
    }

    const updates = await UpdateModel.find<UpdateAttributes>({
      proposal_id: proposalId,
      status: UpdateStatus.Pending,
    })

    const currentUpdate = getCurrentUpdate(updates)
    const nextPendingUpdate = getNextPendingUpdate(updates)

    if (updates.length > 0 && (currentUpdate || nextPendingUpdate)) {
      throw new RequestError(`Updates pending for this proposal`, RequestError.BadRequest)
    }

    const data: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'> =
      {
        proposal_id: proposal.id,
        author,
        health,
        introduction,
        highlights,
        blockers,
        next_steps,
        additional_notes,
      }
    const update = await UpdateModel.createUpdate(data)
    await EventsService.updateCreated(update.id, proposal.id, proposal.title, user)
    await DiscourseService.createUpdate(update, proposal.title)
    DiscordService.newUpdate(proposal.id, proposal.title, update.id, user)

    return update
  }
}
