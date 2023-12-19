import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { Discourse, DiscoursePost } from '../../clients/Discourse'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UpdateModel from '../../entities/Updates/model'
import { GeneralUpdate, UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import { getUpdateUrl } from '../../entities/Updates/utils'
import { inBackground } from '../../helpers'
import { ErrorService } from '../../services/ErrorService'
import { FinancialService } from '../../services/FinancialService'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'

export class UpdateService {
  static async getById(id: UpdateAttributes['id']) {
    try {
      const update = await UpdateModel.findOne<UpdateAttributes>({ id })
      if (update) {
        const records = await FinancialService.getRecords(update.id)
        if (records) {
          return { ...update, records }
        }
      }
      return update
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error fetching update', { id, error, category: ErrorCategory.Update })
      } else {
        console.error(error)
      }
      return null
    }
  }

  static async getAllByProposalId(proposal_id: ProposalAttributes['id'], status?: UpdateStatus) {
    try {
      const parameters = { proposal_id }
      return await UpdateModel.find<UpdateAttributes>(status ? { ...parameters, status } : parameters)
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error fetching updates', { proposal_id, error, category: ErrorCategory.Update })
      } else {
        console.error(error)
      }
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
      if (isProdEnv()) {
        ErrorService.report('Error updating update', { id, error, category: ErrorCategory.Update })
      } else {
        console.error(error)
      }
      return null
    }
  }

  static async create(
    update: {
      proposal_id: string
      author: string
    } & GeneralUpdate
  ) {
    try {
      return await UpdateModel.createUpdate(update)
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error creating update', { update, error, category: ErrorCategory.Update })
      } else {
        console.error(error)
      }
      return null
    }
  }

  static async update(
    id: UpdateAttributes['id'],
    newUpdate: Omit<UpdateAttributes, 'id' | 'due_date' | 'created_at' | 'proposal_id'>
  ) {
    try {
      return await UpdateModel.update<UpdateAttributes>(newUpdate, { id })
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error updating update', { id, error, category: ErrorCategory.Update })
      } else {
        console.error(error)
      }
      return null
    }
  }

  static async delete(id: UpdateAttributes['id']) {
    try {
      return await UpdateModel.delete<UpdateAttributes>({ id })
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error deleting update', { id, error, category: ErrorCategory.Update })
      } else {
        console.error(error)
      }
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
}
