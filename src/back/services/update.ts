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

  static async create(newUpdate: Omit<UpdateAttributes, 'id' | 'created_at' | 'updated_at' | 'status'>, user: string) {
    const { proposal_id, author, health, introduction, highlights, blockers, next_steps, additional_notes } = newUpdate
    const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: proposal_id })
    const isAuthorOrCoauthor =
      user && (proposal?.user === user || (await CoauthorService.isCoauthor(proposal_id, user))) && author === user

    if (!proposal || !isAuthorOrCoauthor) {
      throw new RequestError(`Unauthorized`, RequestError.Forbidden)
    }

    const updates = await UpdateModel.find<UpdateAttributes>({
      proposal_id,
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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // TODO: refactor this to use the UpdateAttributes type
  static async updateProposalUpdate(
    update: UpdateAttributes,
    author: any,
    health: any,
    introduction: any,
    highlights: any,
    blockers: any,
    next_steps: any,
    additional_notes: any,
    completion_date: Date | undefined,
    id: string,
    proposal: ProposalAttributes<any>,
    user: string,
    now: Date,
    isOnTime: boolean
  ) {
    const status = !update.due_date || isOnTime ? UpdateStatus.Done : UpdateStatus.Late

    await UpdateModel.update<UpdateAttributes>(
      {
        author,
        health,
        introduction,
        highlights,
        blockers,
        next_steps,
        additional_notes,
        status,
        completion_date: completion_date || now,
        updated_at: now,
      },
      { id }
    )

    const updatedUpdate = await UpdateService.getById(id)
    if (updatedUpdate) {
      if (!completion_date) {
        await DiscourseService.createUpdate(updatedUpdate, proposal.title)
        await EventsService.updateCreated(update.id, proposal.id, proposal.title, user)
        DiscordService.newUpdate(proposal.id, proposal.title, update.id, user)
      } else {
        UpdateService.commentUpdateEditInDiscourse(updatedUpdate)
      }
    }

    return true
  }
}
