import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { Discourse, DiscoursePost } from '../../clients/Discourse'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UpdateModel from '../../entities/Updates/model'
import { UpdateAttributes } from '../../entities/Updates/types'
import { getUpdateUrl } from '../../entities/Updates/utils'
import { inBackground } from '../../helpers'

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
}
