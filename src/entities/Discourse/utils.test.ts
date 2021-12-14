import { DiscourseTopic, DiscoursePostInTopic } from '../../api/Discourse'
import { ProposalComment } from '../Proposal/types'
import { filterComments, DISCOURSE_USER, BASE_AVATAR_URL } from './utils'
import { createWithPosts, ONE_USER_POST, SEVERAL_USERS_POST } from './__data__/discourse_samples'

describe('filterUserComments', () => {
  let discourseTopic: DiscourseTopic
  let posts:DiscoursePostInTopic[]
  let filteredComments: ProposalComment[]

  beforeEach(() => {
    discourseTopic = createWithPosts(posts)
    filteredComments = filterComments(discourseTopic)
  })

  describe('when there are DAO/system comments and a user comments on a discourse topic', () => {
    beforeAll(() => {
      posts = ONE_USER_POST
    })

    it('should contain the base discourse avatar url in the user avatar url', () => {
      expect(filteredComments[0].avatar_url).toContain(BASE_AVATAR_URL)
    });

    it('should return a parsed list of the user comments with avatar, username, user comment, and comment date', () => {
      expect(filteredComments[0].username).toBe('yemel')
      expect(filteredComments[0].avatar_url).toBe('https://sjc6.discourse-cdn.com/standard10/user_avatar/forum.decentraland.vote/yemel/45/1_2.png')
      expect(filteredComments[0].created_at).toBe('2021-11-19T21:36:13.181Z')
      expect(filteredComments[0].cooked).toBe('<p>I am commenting as Yemel</p>')
    });

    it('should only retrieve the user comment ', () => {
      filteredComments.map(comment => expect(comment.username).not.toEqual(DISCOURSE_USER))
    });
  });

  describe('when there are more than three user comments on a discourse topic', () => {
    beforeAll(() => {
      posts = SEVERAL_USERS_POST
    })

    it('should only retrieve the latest three comments ', () => {
      expect(filteredComments.length).toBe(3)
      filteredComments.map(comment => expect(comment.created_at).not.toEqual("2021-11-19T21:36:13.181Z"))
    });

    describe('when there is a user without an avatar defined in the forum', () => {
      it('should use the forum generic letter avatar in size 45', () => {
        expect(filteredComments[2].avatar_url).toBe("https://avatars.discourse-cdn.com/v4/letter/n/b782af/45.png")
      });
    });
  })

  describe('when there are no comments on a post', () => {
    beforeAll(() => {
      posts = []
    });
    it('returns an empty list', () => {
      expect(filteredComments).toHaveLength(0)
    });
  });
})
