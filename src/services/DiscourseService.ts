import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

import { UpdateService } from '../back/services/update'
import { Discourse, DiscoursePost, DiscoursePostInTopic } from '../clients/Discourse'
import * as proposalTemplates from '../entities/Proposal/templates'
import { forumUrl, proposalUrl } from '../entities/Proposal/utils'
import * as updateTemplates from '../entities/Updates/templates'
import { UpdateAttributes } from '../entities/Updates/types'
import { getUpdateUrl } from '../entities/Updates/utils'
import UserModel from '../entities/User/model'
import { filterComments } from '../entities/User/utils'
import { inBackground } from '../helpers'
import { Avatar } from '../utils/Catalyst/types'

import { ProposalInCreation } from './ProposalService'
import { SnapshotService } from './SnapshotService'

type Update = Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'>

export class DiscourseService {
  static async createProposal(
    data: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    snapshotUrl: string,
    snapshotId: string
  ) {
    try {
      const discoursePost = await this.getPost(data, profile, proposalId, snapshotUrl, snapshotId)
      const discourseProposal = await Discourse.get().createPost(discoursePost)
      this.logPostCreation(discourseProposal)
      return discourseProposal
    } catch (error: any) {
      SnapshotService.dropSnapshotProposal(snapshotId)
      throw new Error(`Forum error: ${error.body?.errors.join(', ')}`, error)
    }
  }

  static async createUpdate(data: Update, updateId: string) {
    try {
      const discoursePost = this.getUpdatePost(data, updateId)
      const discourseUpdate = await Discourse.get().createPost(discoursePost)
      await UpdateService.update(updateId, discourseUpdate)
      this.logPostCreation(discourseUpdate)
      return discourseUpdate
    } catch (error: any) {
      throw new Error(`Forum error: ${error.body?.errors.join(', ')}`, error)
    }
  }

  private static async getPost(
    data: ProposalInCreation,
    profile: Avatar | null,
    proposalId: string,
    snapshotUrl: string,
    snapshotId: string
  ) {
    const template: proposalTemplates.ForumTemplate = {
      type: data.type,
      configuration: data.configuration,
      user: data.user,
      profile,
      proposal_url: proposalUrl(proposalId),
      snapshot_url: snapshotUrl,
      snapshot_id: snapshotId,
    }

    return {
      category: this.getCategory(),
      title: proposalTemplates.forumTitle(template),
      raw: await proposalTemplates.forumDescription(template),
    }
  }

  private static getUpdatePost(data: Update, update_id: string) {
    const template: updateTemplates.ForumTemplate = {
      user: data.author || '',
      title: `${update_id} for proposal ${data.proposal_id}`,
      update_id,
      update_url: getUpdateUrl(update_id, data.proposal_id),
    }

    return {
      category: this.getCategory(),
      title: updateTemplates.forumTitle(template),
      raw: updateTemplates.forumDescription(template),
    }
  }

  public static getCategory(): number | undefined {
    const DISCOURSE_CATEGORY = requiredEnv('GATSBY_DISCOURSE_CATEGORY')
    return DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined
  }

  private static logPostCreation(post: DiscoursePost) {
    logger.log('Discourse post created', {
      forum_url: forumUrl(post.topic_slug, post.topic_id),
      discourse_proposal: JSON.stringify(post),
    })
  }

  static dropDiscourseTopic(topic_id: number) {
    inBackground(() => {
      logger.log('Dropping discourse topic', { topic_id: topic_id })
      return Discourse.get().removeTopic(topic_id)
    })
  }

  static async getPostComments(discourseTopicId: number) {
    const DISCOURSE_BATCH_SIZE = 20
    const topic = await Discourse.get().getTopic(discourseTopicId)
    let allComments: DiscoursePostInTopic[] = topic.post_stream.posts //first 20
    let skip = DISCOURSE_BATCH_SIZE
    if (topic.post_stream.stream.length > DISCOURSE_BATCH_SIZE) {
      let hasNext = true
      try {
        while (hasNext) {
          const postIds = topic.post_stream.stream.slice(skip, skip + DISCOURSE_BATCH_SIZE)
          if (postIds.length === 0) break
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

    const userIds = new Set(allComments.map((comment) => comment.user_id))
    const users = await UserModel.getAddressesByForumId(Array.from(userIds))

    return filterComments(allComments, users)
  }

  static async getUserById(id: number) {
    try {
      return await Discourse.get().getUserById(id)
    } catch (error) {
      console.error(`Error getting Discourse user: ${id}`, error)
      return null
    }
  }
}
