import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

import { Discourse, DiscoursePost } from '../clients/Discourse'
import * as templates from '../entities/Proposal/templates'
import { forumUrl, proposalUrl } from '../entities/Proposal/utils'
import { inBackground } from '../helpers'

import { ProposalInCreation } from './ProposalService'
import { SnapshotService } from './SnapshotService'

const DISCOURSE_CATEGORY = requiredEnv('DISCOURSE_CATEGORY')

export class DiscourseService {
  static async createProposal(
    data: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    snapshotUrl: string,
    snapshotId: string
  ) {
    try {
      const discoursePost = await this.getDiscoursePost(data, profile, proposalId, snapshotUrl, snapshotId)
      console.log('DISCOURSE_POST', discoursePost)
      const discourseProposal = await Discourse.get().createPost(discoursePost)
      console.log('DISCOURSE_PROPOSAL', discourseProposal)
      this.logProposalCreation(discourseProposal)
      return discourseProposal
    } catch (error: any) {
      SnapshotService.dropSnapshotProposal(snapshotId)
      throw new Error(`Forum error: ${error.body?.errors.join(', ')}`, error)
    }
  }

  private static async getDiscoursePost(
    data: ProposalInCreation,
    profile: Avatar | null,
    proposalId: string,
    snapshotUrl: string,
    snapshotId: string
  ) {
    const discourseTemplateProps: templates.ForumTemplateProps = {
      type: data.type,
      configuration: data.configuration,
      user: data.user,
      profile,
      proposal_url: proposalUrl({ id: proposalId }),
      snapshot_url: snapshotUrl,
      snapshot_id: snapshotId,
    }

    return {
      category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
      title: templates.forumTitle(discourseTemplateProps),
      raw: await templates.forumDescription(discourseTemplateProps),
    }
  }

  private static logProposalCreation(discourseProposal: DiscoursePost) {
    logger.log('Discourse proposal created', {
      forum_url: forumUrl({
        discourse_topic_slug: discourseProposal.topic_slug,
        discourse_topic_id: discourseProposal.topic_id,
      }),
      discourse_proposal: JSON.stringify(discourseProposal),
    })
  }

  static dropDiscourseTopic(topic_id: number) {
    inBackground(() => {
      logger.log('Dropping discourse topic', { topic_id: topic_id })
      return Discourse.get().removeTopic(topic_id)
    })
  }
}
