import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

import { Discourse, DiscoursePost, DiscoursePostInTopic } from '../clients/Discourse'
import * as templates from '../entities/Proposal/templates'
import { forumUrl, proposalUrl } from '../entities/Proposal/utils'
import { inBackground } from '../helpers'
import { Avatar } from '../utils/Catalyst/types'

import { ProposalInCreation } from './ProposalService'
import { SnapshotService } from './SnapshotService'

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
      const discourseProposal = await Discourse.get().createPost(discoursePost)
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
      category: this.getCategory(),
      title: templates.forumTitle(discourseTemplateProps),
      raw: await templates.forumDescription(discourseTemplateProps),
    }
  }

  public static getCategory(): number | undefined {
    const DISCOURSE_CATEGORY = requiredEnv('GATSBY_DISCOURSE_CATEGORY')
    return DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined
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

  static async fetchAllComments(discourseTopicId: number) {
    const DISCOURSE_BATCH_SIZE = 20
    const topic = await Discourse.get().getTopic(discourseTopicId)
    let allComments: DiscoursePostInTopic[] = topic.post_stream.posts //first 20
    let skip = DISCOURSE_BATCH_SIZE
    if (topic.post_stream.stream.length > DISCOURSE_BATCH_SIZE) {
      let hasNext = true
      try {
        while (hasNext) {
          const postIds = topic.post_stream.stream.slice(skip, skip + DISCOURSE_BATCH_SIZE)
          if (postIds.length === 0) return allComments
          const newPostsResponse = await Discourse.get().getPosts(discourseTopicId, postIds)
          const newComments = newPostsResponse.post_stream.posts
          allComments = [...allComments, ...newComments]
          if (newComments.length < DISCOURSE_BATCH_SIZE) {
            hasNext = false
          } else {
            skip = allComments.length
          }
        }
      } catch (error) {
        console.error(`Error while fetching discourse posts in batches: `, error)
      }
    }
    return allComments
  }
}
