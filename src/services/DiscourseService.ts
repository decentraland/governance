import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'

import { DiscourseClient, DiscoursePost } from '../api/DiscourseClient'
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY } from '../entities/Discourse/utils'
import { ProposalInCreation } from '../entities/Proposal/ProposalCreator'
import { SnapshotProposalCreator } from '../entities/Proposal/SnapshotProposalCreator'
import { inBackground } from '../entities/Proposal/routes'
import * as templates from '../entities/Proposal/templates'
import { forumUrl, proposalUrl } from '../entities/Proposal/utils'

export class DiscourseService {
  static async createProposalInDiscourse(
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

      discourseProposal = await DiscourseClient.get().createPost(
        {
          category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
          title: templates.forumTitle(discourseTemplateProps),
          raw: await templates.forumDescription(discourseTemplateProps),
        },
        DISCOURSE_AUTH
      )
    } catch (error: any) {
      SnapshotProposalCreator.dropSnapshotProposal(snapshotId)
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

  static dropDiscourseTopic(topic_id: number) {
    inBackground(() => {
      logger.log('Dropping discourse topic', { topic_id: topic_id })
      return DiscourseClient.get().removeTopic(topic_id, DISCOURSE_AUTH)
    })
  }
}
