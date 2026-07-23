import { FORUM_URL } from '../../constants'
import { DiscoursePostInTopic, DiscourseTopic } from '../../shared/types/discourse'
import { ProposalCommentsInDiscourse } from '../Proposal/types'

import { ONE_USER_POST, SEVERAL_USERS_POST, createWithPosts } from './__data__/discourse_samples'

import { ValidationComment } from './types'
import { DISCOURSE_USER, filterComments, getValidationComment } from './utils'

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
  const address = '0xf1e1c1d1a1b1c1d1e1f1a1b1c1d1e1f1a1b1c1d1'
  const timestamp = '2026-07-23T12:00:00.000Z'

  describe('when exactly one recent comment contains the address and timestamp', () => {
    let comments: ValidationComment[]
    let result: ValidationComment | undefined

    beforeEach(() => {
      comments = [
        { id: '1', userId: '100', content: 'unrelated chatter', timestamp: Date.now() },
        { id: '2', userId: '200', content: `Linking ${address} Date: ${timestamp} 0xsignature`, timestamp: Date.now() },
      ]
      result = getValidationComment(comments, address, timestamp)
    })

    it('should return the matching comment', () => {
      expect(result?.userId).toBe('200')
    })
  })

  describe('when no comment contains both the address and the timestamp', () => {
    let comments: ValidationComment[]
    let result: ValidationComment | undefined

    beforeEach(() => {
      comments = [{ id: '1', userId: '100', content: `Linking ${address} Date: 1999-01-01`, timestamp: Date.now() }]
      result = getValidationComment(comments, address, timestamp)
    })

    it('should return undefined', () => {
      expect(result).toBeUndefined()
    })
  })

  describe('when the only matching comment is older than the validation window', () => {
    let comments: ValidationComment[]
    let result: ValidationComment | undefined

    beforeEach(() => {
      comments = [{ id: '1', userId: '100', content: `Linking ${address} Date: ${timestamp}`, timestamp: 0 }]
      result = getValidationComment(comments, address, timestamp)
    })

    it('should ignore it and return undefined', () => {
      expect(result).toBeUndefined()
    })
  })

  describe('when a second comment copies the same address and timestamp from another account', () => {
    let action: () => ValidationComment | undefined

    beforeEach(() => {
      const comments: ValidationComment[] = [
        { id: '1', userId: '200', content: `Linking ${address} Date: ${timestamp} 0xsignature`, timestamp: Date.now() },
        { id: '2', userId: '999', content: `Linking ${address} Date: ${timestamp} 0xsignature`, timestamp: Date.now() },
      ]
      action = () => getValidationComment(comments, address, timestamp)
    })

    it('should throw instead of linking an ambiguous account', () => {
      expect(action).toThrow('Multiple matching verification comments found')
    })
  })
})
