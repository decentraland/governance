import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { Discourse } from '../../clients/Discourse'
import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UpdateModel from '../../entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import { getCurrentUpdate, getNextPendingUpdate, getUpdateUrl } from '../../entities/Updates/utils'
import { inBackground } from '../../helpers'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { FinancialService } from '../../services/FinancialService'
import { DiscoursePost } from '../../shared/types/discourse'
import { ErrorCategory } from '../../utils/errorCategories'

import { CoauthorService } from './coauthor'
import { DiscordService } from './discord'
import { EventsService } from './events'

export class UpdateService {
  static async getById(id: UpdateAttributes['id']): Promise<UpdateAttributes | undefined | null> {
    try {
      const update = await UpdateModel.findOne<UpdateAttributes>({ id })
      if (update) {
        const financial_records = await FinancialService.getRecordsByUpdateId(update.id)
        if (financial_records) {
          return { ...update, financial_records }
        }
      }
      return update
    } catch (error) {
      ErrorService.report('Error fetching update', { id, error, category: ErrorCategory.Update })
      return null
    }
  }

  static async getAllByProposalId(proposal_id: ProposalAttributes['id'], status?: UpdateStatus) {
    try {
      const parameters = { proposal_id }
      return await UpdateModel.find<UpdateAttributes>(status ? { ...parameters, status } : parameters)
    } catch (error) {
      ErrorService.report('Error fetching updates', { proposal_id, error, category: ErrorCategory.Update })
      return []
    }
  }

  static async updateWithDiscoursePost(id: UpdateAttributes['id'], discoursePost: DiscoursePost) {
    try {
      return await UpdateModel.update(
        { discourse_topic_id: discoursePost.topic_id, discourse_topic_slug: discoursePost.topic_slug },
        { id }
      )
    } catch (error) {
      ErrorService.report('Error updating update', { id, error, category: ErrorCategory.Update })
      return null
    }
  }

  static async delete(update: UpdateAttributes) {
    const { id, due_date } = update
    try {
      if (!due_date) {
        return await UpdateModel.delete<UpdateAttributes>({ id })
      } else {
        return await UpdateModel.update<UpdateAttributes>(
          {
            status: UpdateStatus.Pending,
            author: undefined,
            health: undefined,
            introduction: undefined,
            highlights: undefined,
            blockers: undefined,
            next_steps: undefined,
            additional_notes: undefined,
            completion_date: undefined,
            updated_at: new Date(),
          },
          { id }
        )
      }
    } catch (error) {
      ErrorService.report('Error deleting update', { id, error, category: ErrorCategory.Update })
    }
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
    const {
      proposal_id,
      author,
      health,
      introduction,
      highlights,
      blockers,
      next_steps,
      additional_notes,
      financial_records,
    } = newUpdate
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
    try {
      if (financial_records) await FinancialService.createRecords(update.id, financial_records)
      await DiscourseService.createUpdate(update, proposal.title)
      await EventsService.updateCreated(update.id, proposal.id, proposal.title, user)
      DiscordService.newUpdate(proposal.id, proposal.title, update.id, user)
    } catch (error) {
      await this.delete(update)
      throw new RequestError(`Error creating update`, RequestError.InternalServerError)
    }

    return update
  }

  static async updateProposalUpdate(
    update: UpdateAttributes,
    newUpdate: Omit<
      UpdateAttributes,
      'id' | 'proposal_id' | 'status' | 'completion_date' | 'updated_at' | 'created_at'
    >,
    id: string,
    proposal: ProposalAttributes,
    user: string,
    now: Date,
    isOnTime: boolean
  ) {
    const status = !update.due_date || isOnTime ? UpdateStatus.Done : UpdateStatus.Late
    const { author, health, introduction, highlights, blockers, next_steps, additional_notes, financial_records } =
      newUpdate

    const records = financial_records || update.financial_records
    if (records) await FinancialService.createRecords(update.id, records)

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
        completion_date: update.completion_date || now,
        updated_at: now,
      },
      { id }
    )

    const updatedUpdate = await UpdateService.getById(id)
    if (updatedUpdate) {
      if (!update.completion_date) {
        await Promise.all([
          DiscourseService.createUpdate(updatedUpdate, proposal.title),
          EventsService.updateCreated(update.id, proposal.id, proposal.title, user),
        ])
        DiscordService.newUpdate(proposal.id, proposal.title, update.id, user)
      } else {
        UpdateService.commentUpdateEditInDiscourse(updatedUpdate)
      }
    }

    return true
  }
}
