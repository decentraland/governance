import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'

import { Discourse, DiscoursePost } from '../clients/Discourse'
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY } from '../entities/Discourse/utils'
import { inBackground } from '../entities/Proposal/routes'
import * as templates from '../entities/Proposal/templates'
import { forumUrl, proposalUrl } from '../entities/Proposal/utils'

import { ProposalInCreation } from './ProposalService'
import { SnapshotService } from './SnapshotService'

export class DiscourseService {
  static async createProposal(
    data: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    snapshot_url: string,
    snapshotId: string
  ) {
    let discourseProposal: DiscoursePost
    try {
      const discourseTemplateProps: templates.ForumTemplateProps = {
        type: data.type,
        configuration: data.configuration,
        user: data.user,
        profile,
        proposal_url: proposalUrl({ id: proposalId }),
        snapshot_url,
        snapshot_id: snapshotId,
      }

      discourseProposal = await Discourse.get().createPost(
        {
          category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
          title: templates.forumTitle(discourseTemplateProps),
          raw: await templates.forumDescription(discourseTemplateProps),
        },
        DISCOURSE_AUTH
      )
    } catch (error: any) {
      SnapshotService.dropSnapshotProposal(snapshotId)
      throw new Error(`Forum error: ${error.body?.errors.join(', ')}`, error)
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

  static dropDiscourseTopic(topic_id: number) {
    inBackground(() => {
      logger.log('Dropping discourse topic', { topic_id: topic_id })
      return Discourse.get().removeTopic(topic_id, DISCOURSE_AUTH)
    })
  }
}
