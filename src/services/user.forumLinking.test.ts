import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Wallet } from 'ethers'

import { ProposalComment } from '../entities/Proposal/types'
import { AccountType } from '../entities/User/types'
import { formatValidationMessage } from '../entities/User/utils'

jest.mock('../entities/User/model', () => ({
  __esModule: true,
  default: {
    createDiscordConnection: jest.fn(),
    createForumConnection: jest.fn(),
  },
}))

// Required after the mock so the service picks up the stubbed model.
/* eslint-disable @typescript-eslint/no-var-requires */
const UserModel = require('../entities/User/model').default
const { DiscourseService, IncompleteDiscourseCommentsError } = require('./DiscourseService')
const { UserService } = require('./user')
/* eslint-enable @typescript-eslint/no-var-requires */

const SIGNER_FORUM_ID = 200
const OTHER_FORUM_ID = 999

function comment(userForumId: number | undefined, cooked: string, createdAt: Date): ProposalComment {
  return {
    user_forum_id: userForumId as number,
    username: `user-${userForumId}`,
    avatar_url: 'https://forum.test.url/avatar.png',
    created_at: createdAt.toISOString(),
    cooked,
  }
}

function stubComments(comments: ProposalComment[]) {
  return jest
    .spyOn(DiscourseService, 'getPostComments')
    .mockResolvedValue({ totalComments: comments.length, comments } as never)
}

describe('linking a forum account to a dao address', () => {
  let signer: Wallet
  let posted: string
  let now: Date
  let createForumConnection: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()
    createForumConnection = UserModel.createForumConnection as jest.Mock

    now = new Date()
    signer = Wallet.createRandom()
    const message = UserService.getValidationMessage(signer.address, AccountType.Forum)
    posted = `${message}\n\n${await signer.signMessage(message)}`
  })

  afterEach(() => {
    const inProgress = (
      UserService as unknown as {
        VALIDATIONS_IN_PROGRESS: Record<string, { message_timeout: NodeJS.Timeout }>
      }
    ).VALIDATIONS_IN_PROGRESS
    Object.keys(inProgress).forEach((key) => {
      clearTimeout(inProgress[key].message_timeout)
      delete inProgress[key]
    })
    jest.restoreAllMocks()
  })

  describe('when only the genuine signer posted their verification comment', () => {
    let result: { valid: boolean }
    let getPostComments: jest.SpyInstance

    beforeEach(async () => {
      getPostComments = stubComments([comment(SIGNER_FORUM_ID, posted, now)])
      result = await UserService.validateForumUser(signer.address)
    })

    it('should require a complete forum comment set', () => {
      expect(getPostComments).toHaveBeenCalledWith(expect.any(Number), { requireComplete: true })
    })

    it('should report the validation as valid', () => {
      expect(result.valid).toBe(true)
    })

    it('should link the forum account of the genuine signer', () => {
      expect(createForumConnection).toHaveBeenCalledWith(signer.address, String(SIGNER_FORUM_ID))
    })
  })

  describe('when another forum account reposts the verification comment verbatim', () => {
    let thrown: Error

    beforeEach(async () => {
      stubComments([
        comment(SIGNER_FORUM_ID, posted, now),
        comment(OTHER_FORUM_ID, posted, new Date(now.getTime() + 1200)),
      ])
      thrown = (await UserService.validateForumUser(signer.address).catch((error: Error) => error)) as Error
    })

    it('should refuse the ambiguous match', () => {
      expect(thrown.message).toBe('Multiple forum accounts posted the same valid verification message')
    })

    it('should not link any forum account', () => {
      expect(createForumConnection).not.toHaveBeenCalled()
    })
  })

  describe('when the complete forum history cannot be fetched', () => {
    let thrown: RequestError

    beforeEach(async () => {
      jest
        .spyOn(DiscourseService, 'getPostComments')
        .mockRejectedValue(new IncompleteDiscourseCommentsError(123) as never)
      thrown = (await UserService.validateForumUser(signer.address).catch(
        (error: RequestError) => error
      )) as RequestError
    })

    it('should expose a retryable service-unavailable status', () => {
      expect(thrown.statusCode).toBe(503)
    })

    it('should identify the incomplete validation source', () => {
      expect(thrown.code).toBe('validation_source_incomplete')
    })

    it('should not link a forum account', () => {
      expect(createForumConnection).not.toHaveBeenCalled()
    })
  })

  // A message signed for the discord flow must not satisfy the forum one.
  describe('when the comment carries a signature made for another account type', () => {
    let result: { valid: boolean }

    beforeEach(async () => {
      const discordMessage = formatValidationMessage(signer.address, now.toISOString(), AccountType.Discord)
      const signature = await signer.signMessage(discordMessage)
      stubComments([comment(SIGNER_FORUM_ID, `${discordMessage}\n\n${signature}`, now)])
      result = await UserService.validateForumUser(signer.address)
    })

    it('should not link the account', () => {
      expect(result.valid).toBe(false)
    })
  })

  // Comments arrive as Discourse's rendered `cooked` html, not as the plain text the user typed, so
  // the address, timestamp and signature all have to survive that rendering to be matched.
  describe('when the comment arrives as rendered discourse html', () => {
    let result: { valid: boolean }

    beforeEach(async () => {
      const message = UserService.getValidationMessage(signer.address, AccountType.Forum)
      const signature = await signer.signMessage(message)
      const [statement, date] = message.split('\n\n')
      const cooked =
        `<p>${statement}<br>\n${date}</p>\n<p>${signature}</p>\n` +
        `<p><a href="https://forum.test.url/t/1234" rel="noopener nofollow ugc">the thread</a></p>`
      stubComments([comment(SIGNER_FORUM_ID, cooked, now)])
      result = await UserService.validateForumUser(signer.address)
    })

    it('should still link the account', () => {
      expect(result.valid).toBe(true)
    })

    it('should link the author of that comment', () => {
      expect(createForumConnection).toHaveBeenCalledWith(signer.address, String(SIGNER_FORUM_ID))
    })
  })

  describe('when a matching comment has no forum author id', () => {
    let result: { valid: boolean }

    beforeEach(async () => {
      stubComments([comment(undefined, posted, now)])
      result = await UserService.validateForumUser(signer.address)
    })

    it('should ignore it rather than link an unattributable comment', () => {
      expect(createForumConnection).not.toHaveBeenCalled()
      expect(result.valid).toBe(false)
    })
  })

  describe('when the forum account is already linked to another address', () => {
    let thrown: Error

    beforeEach(async () => {
      createForumConnection.mockRejectedValueOnce(Object.assign(new Error('duplicate key'), { code: '23505' }))
      stubComments([comment(SIGNER_FORUM_ID, posted, now)])
      thrown = (await UserService.validateForumUser(signer.address).catch((error: Error) => error)) as Error
    })

    it('should explain the conflict rather than surface the driver error', () => {
      expect(thrown.message).toBe('That Forum account is already linked to another address')
    })
  })
})
