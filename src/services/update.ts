import crypto from 'crypto'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { Discourse } from '../clients/Discourse'
import { VestingWithLogs } from '../clients/VestingData'
import { ProposalAttributes } from '../entities/Proposal/types'
import UpdateModel from '../entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../entities/Updates/types'
import {
  getCurrentUpdate,
  getNextPendingUpdate,
  getUpdateUrl,
  isBetweenLateThresholdDate,
} from '../entities/Updates/utils'
import { inBackground } from '../helpers'
import { Project } from '../models/Project'
import { DiscourseService } from '../services/DiscourseService'
import { ErrorService } from '../services/ErrorService'
import { FinancialService } from '../services/FinancialService'
import { ProjectService } from '../services/ProjectService'
import { DiscoursePost } from '../shared/types/discourse'
import Time from '../utils/date/Time'
import { getMonthsBetweenDates } from '../utils/date/getMonthsBetweenDates'
import { ErrorCategory } from '../utils/errorCategories'

import { VestingService } from './VestingService'
import { DiscordService } from './discord'
import { EventsService } from './events'

interface Ids {
  id: UpdateAttributes['id']
  proposal_id: ProposalAttributes['id']
  project_id: Project['id']
}

export class UpdateService {
  public static getDueDate(startingDate: Time.Dayjs, index: number) {
    return startingDate.add(1 + index, 'months').toDate()
  }

  private static async getAllById(ids: Partial<Ids>, status?: UpdateStatus) {
    try {
      return await UpdateModel.find<UpdateAttributes>(status ? { ...ids, status } : ids)
    } catch (error) {
      ErrorService.report('Error fetching updates', { ids, error, category: ErrorCategory.Update })
      return []
    }
  }

  static async getById(id: UpdateAttributes['id']): Promise<UpdateAttributes | undefined | null> {
    const updates = await this.getAllById({ id })
    const update = updates[0]
    if (update) {
      try {
        const financial_records = await FinancialService.getRecordsByUpdateId(update.id)
        return { ...update, financial_records }
      } catch (error) {
        ErrorService.report('Error fetching financial records', { id, error, category: ErrorCategory.Update })
        return update
      }
    }
    return update
  }

  static async getAllByProposalId(proposal_id: ProposalAttributes['id'], status?: UpdateStatus) {
    const updates = await this.getAllById({ proposal_id }, status)
    return updates
  }

  static async getAllByProjectId(project_id: Project['id'], status?: UpdateStatus) {
    const updates = await this.getAllById({ project_id }, status)
    return updates
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

  static async create(
    newUpdate: Omit<UpdateAttributes, 'id' | 'proposal_id' | 'project_id' | 'created_at' | 'updated_at' | 'status'>,
    project: Project,
    user: string
  ) {
    const { author, health, introduction, highlights, blockers, next_steps, additional_notes, financial_records } =
      newUpdate

    const { proposal_id, title } = project
    const updates = await this.getAllByProposalId(proposal_id, UpdateStatus.Pending)

    const currentUpdate = getCurrentUpdate(updates)
    const nextPendingUpdate = getNextPendingUpdate(updates)

    if (updates.length > 0 && (currentUpdate || nextPendingUpdate)) {
      throw new RequestError(`Updates pending for this proposal`, RequestError.BadRequest)
    }

    const data: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'> =
      {
        proposal_id,
        project_id: project.id,
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
      await DiscourseService.createUpdate(update, title)
      await EventsService.updateCreated(update.id, proposal_id, title, user)
      DiscordService.newUpdate(proposal_id, title, update.id, user)
    } catch (error) {
      await this.delete(update)
      throw new RequestError(`Error creating update`, RequestError.InternalServerError)
    }

    return update
  }

  static async createPendingUpdatesForVesting(projectId: string, initialVestingAddresses?: string[]) {
    if (projectId.length < 0) throw new Error('Unable to create updates for empty project id')

    const project = await ProjectService.getUpdatedProject(projectId)
    const { vesting_addresses, proposal_id } = project
    const vestingAddresses = initialVestingAddresses || vesting_addresses
    const vesting = await VestingService.getVestingWithLogs(vestingAddresses[vestingAddresses.length - 1], proposal_id)

    const now = new Date()
    const updatesQuantity = this.getAmountOfUpdates(vesting)
    const firstUpdateStartingDate = Time.utc(vesting.start_at).startOf('day')

    await UpdateModel.delete<UpdateAttributes>({ project_id: projectId, status: UpdateStatus.Pending })

    const updates = Array.from(Array(updatesQuantity), (_, index) => {
      const update: UpdateAttributes = {
        id: crypto.randomUUID(),
        proposal_id,
        project_id: projectId,
        status: UpdateStatus.Pending,
        due_date: this.getDueDate(firstUpdateStartingDate, index),
        created_at: now,
        updated_at: now,
      }

      return update
    })
    return await UpdateModel.createMany(updates)
  }

  static async updateProjectUpdate(
    update: UpdateAttributes,
    project: Project,
    newUpdate: Omit<
      UpdateAttributes,
      'id' | 'proposal_id' | 'project_id' | 'status' | 'completion_date' | 'updated_at' | 'created_at'
    >,
    user: string
  ): Promise<boolean> {
    const id = update.id

    const now = new Date()
    const isOnTime = Time(now).isBefore(update.due_date)

    if (!isOnTime && !isBetweenLateThresholdDate(update.due_date)) {
      throw new Error(`Update is not on time: "${update.id}"`)
    }

    const status = !update.due_date || isOnTime ? UpdateStatus.Done : UpdateStatus.Late
    const { author, health, introduction, highlights, blockers, next_steps, additional_notes, financial_records } =
      newUpdate

    const records = financial_records || update.financial_records
    if (records && records.length > 0) await FinancialService.createRecords(update.id, records)

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
    const { proposal_id, title } = project
    if (updatedUpdate) {
      if (!update.completion_date) {
        await Promise.all([
          DiscourseService.createUpdate(updatedUpdate, title),
          EventsService.updateCreated(update.id, proposal_id, title, user),
        ])
        DiscordService.newUpdate(proposal_id, title, update.id, user)
      } else {
        UpdateService.commentUpdateEditInDiscourse(updatedUpdate)
      }
    }

    return true
  }

  static getAmountOfUpdates(vesting: VestingWithLogs) {
    const exactDuration = getMonthsBetweenDates(new Date(vesting.start_at), new Date(vesting.finish_at))
    return exactDuration.months + (exactDuration.extraDays > 0 ? 1 : 0)
  }
}
