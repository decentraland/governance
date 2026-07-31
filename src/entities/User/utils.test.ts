import { Wallet } from 'ethers'

import { FORUM_URL } from '../../constants'
import { DiscoursePostInTopic, DiscourseTopic } from '../../shared/types/discourse'
import { ProposalCommentsInDiscourse } from '../Proposal/types'

import { ONE_USER_POST, SEVERAL_USERS_POST, createWithPosts } from './__data__/discourse_samples'

import { AccountType, ValidationComment } from './types'
import { DISCOURSE_USER, filterComments, formatValidationMessage, getValidationComment } from './utils'

jest.mock('../../constants', () => ({
  FORUM_URL: 'https://forum.test.url',
}))

describe('filterUserComments', () => {
  let discourseTopic: DiscourseTopic
  let posts: DiscoursePostInTopic[]
  let filteredComments: ProposalCommentsInDiscourse

  beforeEach(() => {
    discourseTopic = createWithPosts(posts)
    filteredComments = filterComments(discourseTopic.post_stream.posts)
  })

  describe('when there are DAO/system comments and a user comments on a discourse topic', () => {
    beforeAll(() => {
      posts = ONE_USER_POST
    })

    it('should say there is only one comment', () => {
      expect(filteredComments.totalComments).toBe(1)
    })

    it('should contain the base discourse forum url in the user avatar url', () => {
      expect(filteredComments.comments[0].avatar_url).toContain(FORUM_URL)
    })

    it('should return a parsed list of the user comments with avatar, username, user comment, and comment date', () => {
      expect(filteredComments.comments[0].username).toBe('yemel')
      expect(filteredComments.comments[0].avatar_url).toBe(
        `${FORUM_URL}/user_avatar/forum.decentraland.vote/yemel/45/1_2.png`
      )
      expect(filteredComments.comments[0].created_at).toBe('2021-11-19T21:36:13.181Z')
      expect(filteredComments.comments[0].cooked).toBe('<p>I am commenting as Yemel</p>')
    })

    it('should only retrieve the user comment ', () => {
      filteredComments.comments.map((comment) => expect(comment.username).not.toEqual(DISCOURSE_USER))
    })
  })

  describe('when there are several user comments on a discourse topic', () => {
    beforeAll(() => {
      posts = SEVERAL_USERS_POST
    })

    it('should return the total amount of user comments', () => {
      expect(filteredComments.totalComments).toBe(4)
    })

    it('should retrieve all user comments ', () => {
      expect(filteredComments.comments.length).toBe(4)
      expect(filteredComments.comments[0].created_at).toEqual('2021-11-19T21:36:13.181Z')
    })

    describe('when there is a user without an avatar defined in the forum', () => {
      it('should use the forum generic letter avatar in size 45', () => {
        expect(filteredComments.comments[2].avatar_url).toBe(
          'https://avatars.discourse-cdn.com/v4/letter/n/b782af/45.png'
        )
      })
    })
  })

  describe('when there are no comments on a post', () => {
    beforeAll(() => {
      posts = []
    })
    it('should say there are no comments', () => {
      expect(filteredComments.totalComments).toBe(0)
    })
    it('returns an empty list', () => {
      expect(filteredComments.comments).toHaveLength(0)
    })
  })
})

describe('getValidationComment', () => {
  const timestamp = '2026-07-23T12:00:00.000Z'
  let signer: Wallet
  let address: string
  let signedContent: string

  beforeEach(async () => {
    signer = Wallet.createRandom()
    address = signer.address
    const message = formatValidationMessage(address, timestamp, AccountType.Discord)
    signedContent = `${message}\n\n${await signer.signMessage(message)}`
  })

  describe('when exactly one recent comment carries a signature for the address', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '1', userId: '100', content: 'unrelated chatter', timestamp: Date.now() },
        { id: '2', userId: '200', content: signedContent, timestamp: Date.now() },
      ]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should return the matching comment', () => {
      expect(result?.userId).toBe('200')
    })
  })

  describe('when no comment contains both the address and the timestamp', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '1', userId: '100', content: `Linking ${address} Date: 1999-01-01`, timestamp: Date.now() },
      ]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should return undefined', () => {
      expect(result).toBeUndefined()
    })
  })

  describe('when the only matching comment is older than the validation window', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [{ id: '1', userId: '100', content: signedContent, timestamp: 0 }]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should ignore it and return undefined', () => {
      expect(result).toBeUndefined()
    })
  })

  describe('when the comment carries the address and timestamp but no valid signature', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        {
          id: '1',
          userId: '100',
          content: `Linking ${address} Date: ${timestamp} 0xnotasignature`,
          timestamp: Date.now(),
        },
      ]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should not treat it as a candidate', () => {
      expect(result).toBeUndefined()
    })
  })

  // Well formed enough to be extracted, but recovery throws on it. That must be a rejected
  // candidate rather than an error escaping to the caller as a 500.
  describe('when the extracted signature cannot be recovered at all', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const unrecoverable = `0x${'aa'.repeat(64)}05`
      const comments: ValidationComment[] = [
        {
          id: '1',
          userId: '100',
          content: `Linking ${address} Date: ${timestamp} ${unrecoverable}`,
          timestamp: Date.now(),
        },
      ]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should return undefined instead of throwing', () => {
      expect(result).toBeUndefined()
    })
  })

  describe('when the signature belongs to a different address', () => {
    let result: ValidationComment | undefined

    beforeEach(async () => {
      const other = Wallet.createRandom()
      const message = formatValidationMessage(address, timestamp, AccountType.Discord)
      const content = `${message}\n\n${await other.signMessage(message)}`
      const comments: ValidationComment[] = [{ id: '1', userId: '100', content, timestamp: Date.now() }]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should return undefined', () => {
      expect(result).toBeUndefined()
    })
  })

  describe('when another account reposts the signed message verbatim', () => {
    let action: () => ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '2', userId: '999', content: signedContent, timestamp: Date.now() + 1200 },
        { id: '1', userId: '200', content: signedContent, timestamp: Date.now() },
      ]
      action = () => getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should throw instead of linking an ambiguous account', () => {
      expect(action).toThrow('Multiple matching verification comments found')
    })
  })

  describe('when the signer posts their own verification message twice', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '2', userId: '200', content: signedContent, timestamp: Date.now() + 500 },
        { id: '1', userId: '200', content: signedContent, timestamp: Date.now() },
      ]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should link that account rather than treat one account as ambiguous', () => {
      expect(result?.userId).toBe('200')
    })
  })

  describe('when matching comments carry no author id', () => {
    let action: () => ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '1', userId: '', content: signedContent, timestamp: Date.now() },
        { id: '2', userId: '', content: signedContent, timestamp: Date.now() + 500 },
      ]
      action = () => getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should ignore them rather than link an unattributable comment', () => {
      expect(action()).toBeUndefined()
    })
  })

  // A copy can be made to look older than the original, so age must not decide the winner.
  describe('and the copy carries an earlier timestamp than the genuine message', () => {
    let action: () => ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '1', userId: '200', content: signedContent, timestamp: Date.now() },
        { id: '2', userId: '999', content: signedContent, timestamp: Date.now() - 3000 },
      ]
      action = () => getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should still refuse rather than prefer the older one', () => {
      expect(action).toThrow('Multiple matching verification comments found')
    })
  })

  // Only signature-valid comments are candidates, so the address and timestamp alone — both public
  // the moment the genuine message is posted — cannot be used to make the match ambiguous.
  describe('and an unsigned copy is posted to interfere with the link', () => {
    let result: ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '2', userId: '999', content: `Linking ${address} Date: ${timestamp}`, timestamp: Date.now() - 5000 },
        { id: '1', userId: '200', content: signedContent, timestamp: Date.now() },
      ]
      result = getValidationComment(comments, address, timestamp, AccountType.Discord)
    })

    it('should ignore it and return the genuine signer', () => {
      expect(result?.userId).toBe('200')
    })
  })
})
