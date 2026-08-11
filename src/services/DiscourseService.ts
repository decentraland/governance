import { RateLimitError } from '../clients/API'
import { Discourse } from '../clients/Discourse'
import { requiredEnv } from '../config'
import ProposalModel from '../entities/Proposal/model'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import * as proposalTemplates from '../entities/Proposal/templates'
import { getUpdateMessage } from '../entities/Proposal/templates/messages'
import { ProposalAttributes } from '../entities/Proposal/types'
import { forumUrl, proposalUrl } from '../entities/Proposal/utils'
import * as updateTemplates from '../entities/Updates/templates'
import { UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates, getUpdateUrl } from '../entities/Updates/utils'
import UserModel from '../entities/User/model'
import { filterComments } from '../entities/User/utils'
import { inBackground } from '../helpers'
import { UpdateService } from '../services/update'
import { VoteService } from '../services/vote'
import { DiscourseComment, DiscourseNewPost, DiscoursePost, DiscoursePostInTopic } from '../shared/types/discourse'
import { DclProfile } from '../utils/Catalyst/types'
import { ErrorCategory } from '../utils/errorCategories'
import logger from '../utils/logger'

import { ErrorService } from './ErrorService'
import { ProposalInCreation } from './ProposalService'
import { SnapshotService } from './SnapshotService'

type GetPostCommentsOptions = {
  requireComplete?: boolean
}

export class IncompleteDiscourseCommentsError extends Error {
  constructor(discourseTopicId: number) {
    super(`Could not fetch every comment for Discourse topic ${discourseTopicId}`)
    this.name = 'IncompleteDiscourseCommentsError'
  }
}

export class DiscourseService {
  private static async createPostWithRetry(post: DiscourseNewPost, retries = 1): Promise<DiscoursePost> {
    try {
      return await Discourse.get().createPost(post)
    } catch (error) {
      if (retries > 0 && error instanceof RateLimitError) {
        const waitMs = error.waitSeconds * 1000
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        return this.createPostWithRetry(post, retries - 1)
      }
      throw error
    }
  }

  static async createProposal(
    data: ProposalInCreation,
    proposalId: string,
    profile: DclProfile | null,
    snapshotUrl: string,
    snapshotId: string
  ) {
    try {
      const discoursePost = await this.getPost(data, profile, proposalId, snapshotUrl, snapshotId)
      const discourseProposal = await this.createPostWithRetry(discoursePost)
      this.logPostCreation(discourseProposal)
      return discourseProposal
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      SnapshotService.dropSnapshotProposal(snapshotId)
      ErrorService.report('Error creating discourse post', {
        proposalId,
        error: `${error}`,
        category: ErrorCategory.Discourse,
      })
      throw new Error(`Forum error: ${error.body?.errors.join(', ')}`, error)
    }
  }

  static async createUpdate(newUpdate: UpdateAttributes, proposalTitle: string) {
    try {
      const updates = await UpdateService.getAllByProposalId(newUpdate.proposal_id)
      const publicUpdates = getPublicUpdates(updates)
      const updateIndex = publicUpdates.findIndex((update) => update.id === newUpdate.id)
      const latestUpdateIndex = updateIndex < 0 ? publicUpdates.length : publicUpdates.length - updateIndex
      const discoursePost = this.getUpdatePost(newUpdate, latestUpdateIndex, proposalTitle)
      const discourseUpdate = await this.createPostWithRetry(discoursePost)
      await UpdateService.updateWithDiscoursePost(newUpdate.id, discourseUpdate)
      this.logPostCreation(discourseUpdate)
      return discourseUpdate
    } catch (error: any) {
      ErrorService.report('Error creating discourse post for update', {
        update_id: newUpdate.id,
        proposal_id: newUpdate.proposal_id,
        error: `${error}`,
        category: ErrorCategory.Discourse,
      })
      throw new Error(`Forum error: ${error.body?.errors.join(', ')}`, error)
    }
  }

  private static async getPost(
    data: ProposalInCreation,
    profile: DclProfile | null,
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

  private static getUpdatePost(update: UpdateAttributes, updateIndex: number, proposalTitle: string) {
    const { id, author, proposal_id } = update
    const template: updateTemplates.ForumTemplate = {
      author: author || '',
      title: `Update #${updateIndex} for project "${proposalTitle}"`,
      update_url: getUpdateUrl(id, proposal_id),
      ...update,
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

  static async getPostComments(discourseTopicId: number, { requireComplete = false }: GetPostCommentsOptions = {}) {
    const DISCOURSE_BATCH_SIZE = 20
    const topic = await Discourse.get()
      .getTopic(discourseTopicId)
      .catch((error) => {
        logger.error('Error while fetching the initial Discourse topic', {
          discourseTopicId,
          error: `${error}`,
        })
        if (requireComplete) {
          throw new IncompleteDiscourseCommentsError(discourseTopicId)
        }
        throw error
      })
    let allComments: DiscoursePostInTopic[] = topic.post_stream.posts //first 20
    if (requireComplete) {
      const returnedPostIds = new Set(allComments.map((comment) => comment.id))
      const initialPostIds = topic.post_stream.stream.slice(0, DISCOURSE_BATCH_SIZE)
      if (initialPostIds.some((postId) => !returnedPostIds.has(postId))) {
        throw new IncompleteDiscourseCommentsError(discourseTopicId)
      }
    }
    let skip = DISCOURSE_BATCH_SIZE
    if (topic.post_stream.stream.length > DISCOURSE_BATCH_SIZE) {
      let hasNext = true
      try {
        while (hasNext) {
          const postIds = topic.post_stream.stream.slice(skip, skip + DISCOURSE_BATCH_SIZE)
          if (postIds.length === 0) break
          const newPostsResponse = await Discourse.get().getPosts(discourseTopicId, postIds)
          const newComments = newPostsResponse.post_stream.posts
          if (requireComplete) {
            const returnedPostIds = new Set(newComments.map((comment) => comment.id))
            if (postIds.some((postId) => !returnedPostIds.has(postId))) {
              throw new IncompleteDiscourseCommentsError(discourseTopicId)
            }
          }
          allComments = [...allComments, ...newComments]
          if (newComments.length < DISCOURSE_BATCH_SIZE) {
            hasNext = false
          } else {
            skip = allComments.length
          }
        }
      } catch (error) {
        logger.error('Error while fetching Discourse posts in batches', {
          discourseTopicId,
          error: `${error}`,
        })
        if (requireComplete) {
          throw new IncompleteDiscourseCommentsError(discourseTopicId)
        }
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

  static commentUpdatedProposal(updatedProposal: ProposalAttributes) {
    inBackground(async () => {
      // TODO: votes are not necessary in all cases, they could be fetched only when needed
      const votes = await VoteService.getVotes(updatedProposal.id)
      const updateMessage = getUpdateMessage(updatedProposal, votes)
      const discourseComment: DiscourseComment = {
        topic_id: updatedProposal.discourse_topic_id,
        raw: updateMessage,
        created_at: new Date().toJSON(),
      }
      await this.commentOnPostWithRetry(discourseComment)
    })
  }

  static async commentOnPostWithRetry(comment: DiscourseComment, retries = 3): Promise<void> {
    try {
      await Discourse.get().commentOnPost(comment)
    } catch (error) {
      if (retries > 0 && error instanceof RateLimitError) {
        const waitMs = error.waitSeconds * 1000
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        return this.commentOnPostWithRetry(comment, retries - 1)
      }
      throw error
    }
  }

  static commentFinishedProposals(proposalsWithOutcome: ProposalWithOutcome[]) {
    inBackground(async () => {
      const ids = proposalsWithOutcome.map(({ id }) => id)
      const updatedProposals = await ProposalModel.findByIds(ids)
      for (const proposal of updatedProposals) {
        try {
          const votes = await VoteService.getVotes(proposal.id)
          const updateMessage = getUpdateMessage(proposal, votes)
          const discourseComment: DiscourseComment = {
            topic_id: proposal.discourse_topic_id,
            raw: updateMessage,
            created_at: new Date().toJSON(),
          }
          await this.commentOnPostWithRetry(discourseComment)
        } catch (error) {
          logger.error('Error commenting on finished proposal', {
            proposalId: proposal.id,
            error: `${error}`,
          })
        }
      }
    })
  }
}
