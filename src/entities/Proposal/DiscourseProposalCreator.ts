import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'

import { DiscourseClient, DiscoursePost } from '../../api/DiscourseClient'
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY } from '../Discourse/utils'

import { ProposalInCreation } from './ProposalCreator'
import { SnapshotProposalCreator } from './SnapshotProposalCreator'
import { inBackground } from './routes'
import * as templates from './templates'
import { forumUrl, proposalUrl } from './utils'

export class DiscourseProposalCreator {
  static async createProposalInDiscourse(
    data: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    snapshot_url: string,
    ipfsHash: string
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
        snapshot_id: ipfsHash,
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
      SnapshotProposalCreator.dropSnapshotProposal(ipfsHash)
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
