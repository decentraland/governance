import { Wallet } from 'ethers'

import { Discourse } from '../clients/Discourse'
import UserModel from '../entities/User/model'
import { AccountType } from '../entities/User/types'
import { DiscoursePostInTopic } from '../shared/types/discourse'
import logger from '../utils/logger'

import { DiscourseService, IncompleteDiscourseCommentsError } from './DiscourseService'
import { UserService } from './user'

jest.mock('../entities/User/model', () => ({
  __esModule: true,
  default: {
    createDiscordConnection: jest.fn(),
    createForumConnection: jest.fn(),
    getAddressesByForumId: jest.fn(),
  },
}))

const TOPIC_ID = 123
const BATCH_SIZE = 20

function createPost(id: number): DiscoursePostInTopic {
  return {
    id,
    username: `user-${id}`,
    user_id: id,
    avatar_template: '/avatar/{size}.png',
    created_at: new Date().toISOString(),
    cooked: `comment-${id}`,
  } as DiscoursePostInTopic
}

describe('DiscourseService.getPostComments', () => {
  let getTopic: jest.Mock
  let getPosts: jest.Mock
  let initialPosts: DiscoursePostInTopic[]
  let remainingPost: DiscoursePostInTopic

  beforeEach(() => {
    initialPosts = Array.from({ length: BATCH_SIZE }, (_, index) => createPost(index + 1))
    remainingPost = createPost(BATCH_SIZE + 1)
    getTopic = jest.fn().mockResolvedValue({
      post_stream: {
        stream: [...initialPosts.map((post) => post.id), remainingPost.id],
        posts: initialPosts,
      },
    })
    getPosts = jest.fn()
    jest.spyOn(Discourse, 'get').mockReturnValue({ getTopic, getPosts } as never)
    jest.spyOn(logger, 'error').mockImplementation(() => undefined)
    ;(UserModel.getAddressesByForumId as jest.Mock).mockResolvedValue([])
  })

  afterEach(() => {
    const validations = (
      UserService as unknown as {
        VALIDATIONS_IN_PROGRESS: Record<string, { message_timeout: NodeJS.Timeout }>
      }
    ).VALIDATIONS_IN_PROGRESS
    Object.keys(validations).forEach((key) => {
      clearTimeout(validations[key].message_timeout)
      delete validations[key]
    })
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('when a pagination request fails', () => {
    beforeEach(() => {
      getPosts.mockRejectedValue(new Error('Discourse unavailable'))
    })

    describe('and complete comments are required', () => {
      let thrown: Error

      beforeEach(async () => {
        thrown = (await DiscourseService.getPostComments(TOPIC_ID, { requireComplete: true }).catch(
          (error: Error) => error
        )) as Error
      })

      it('should reject the partial comment set', () => {
        expect(thrown).toBeInstanceOf(IncompleteDiscourseCommentsError)
      })

      it('should not resolve forum addresses for partial comments', () => {
        expect(UserModel.getAddressesByForumId).not.toHaveBeenCalled()
      })
    })

    describe('and best-effort comments are allowed', () => {
      let totalComments: number

      beforeEach(async () => {
        const result = await DiscourseService.getPostComments(TOPIC_ID)
        totalComments = result.totalComments
      })

      it('should return the comments fetched before the failure', () => {
        expect(totalComments).toBe(BATCH_SIZE)
      })
    })
  })

  describe('when the initial topic request fails', () => {
    beforeEach(() => {
      getTopic.mockRejectedValue(new Error('Discourse unavailable'))
    })

    describe('and complete comments are required', () => {
      let thrown: Error

      beforeEach(async () => {
        thrown = (await DiscourseService.getPostComments(TOPIC_ID, { requireComplete: true }).catch(
          (error: Error) => error
        )) as Error
      })

      it('should reject with an incomplete-source error', () => {
        expect(thrown).toBeInstanceOf(IncompleteDiscourseCommentsError)
      })
    })

    describe('and best-effort comments are allowed', () => {
      let thrown: Error

      beforeEach(async () => {
        thrown = (await DiscourseService.getPostComments(TOPIC_ID).catch((error: Error) => error)) as Error
      })

      it('should preserve the upstream failure', () => {
        expect(thrown.message).toBe('Discourse unavailable')
      })
    })
  })

  describe('when the initial topic response omits a streamed post', () => {
    let thrown: Error

    beforeEach(async () => {
      getTopic.mockResolvedValue({
        post_stream: {
          stream: initialPosts.map((post) => post.id),
          posts: initialPosts.slice(0, BATCH_SIZE - 1),
        },
      })
      thrown = (await DiscourseService.getPostComments(TOPIC_ID, { requireComplete: true }).catch(
        (error: Error) => error
      )) as Error
    })

    it('should reject the incomplete response', () => {
      expect(thrown).toBeInstanceOf(IncompleteDiscourseCommentsError)
    })
  })

  describe('when a pagination response omits a requested post', () => {
    let thrown: Error

    beforeEach(async () => {
      getPosts.mockResolvedValue({ post_stream: { posts: [] } })
      thrown = (await DiscourseService.getPostComments(TOPIC_ID, { requireComplete: true }).catch(
        (error: Error) => error
      )) as Error
    })

    it('should reject the incomplete response', () => {
      expect(thrown).toBeInstanceOf(IncompleteDiscourseCommentsError)
    })
  })

  describe('when every requested post is returned', () => {
    let totalComments: number

    beforeEach(async () => {
      getPosts.mockResolvedValue({ post_stream: { posts: [remainingPost] } })
      const result = await DiscourseService.getPostComments(TOPIC_ID, { requireComplete: true })
      totalComments = result.totalComments
    })

    it('should return the complete comment set', () => {
      expect(totalComments).toBe(BATCH_SIZE + 1)
    })
  })

  describe('when matching signed comments belong to accounts in different pages', () => {
    let thrown: Error

    beforeEach(async () => {
      const signer = Wallet.createRandom()
      const message = UserService.getValidationMessage(signer.address, AccountType.Forum)
      const posted = `${message}\n\n${await signer.signMessage(message)}`
      initialPosts[0] = { ...initialPosts[0], cooked: posted, user_id: 100 }
      remainingPost = { ...remainingPost, cooked: posted, user_id: 200 }
      getTopic.mockResolvedValue({
        post_stream: {
          stream: [...initialPosts.map((post) => post.id), remainingPost.id],
          posts: initialPosts,
        },
      })
      getPosts.mockResolvedValue({ post_stream: { posts: [remainingPost] } })

      thrown = (await UserService.validateForumUser(signer.address).catch((error: Error) => error)) as Error
    })

    it('should reject the cross-page match as ambiguous', () => {
      expect(thrown.message).toBe('Multiple forum accounts posted the same valid verification message')
    })

    it('should not link either forum account', () => {
      expect(UserModel.createForumConnection).not.toHaveBeenCalled()
    })
  })
})
