import { DiscourseTopic, DiscoursePostInTopic } from '../../api/Discourse'
import { ProposalCommentsInDiscourse } from '../Proposal/types'
import { filterComments, DISCOURSE_USER, BASE_AVATAR_URL, DISCOURSE_API_KEY } from './utils'
import { createWithPosts, ONE_USER_POST, SEVERAL_USERS_POST } from './__data__/discourse_samples'

const describeIf = (condition: boolean) => condition ? describe : describe.skip

describeIf(DISCOURSE_API_KEY !== 'DISCOURSE_API_KEY')('filterUserComments', () => {
  let discourseTopic: DiscourseTopic
  let posts:DiscoursePostInTopic[]
  let filteredComments: ProposalCommentsInDiscourse

  beforeEach(() => {
    discourseTopic = createWithPosts(posts)
    filteredComments = filterComments(discourseTopic)
  })

  describe('when there are DAO/system comments and a user comments on a discourse topic', () => {
    beforeAll(() => {
      posts = ONE_USER_POST
    })

    it('should say there is only one comment', () => {
      expect(filteredComments.totalComments).toBe(1)
    });

    it('should contain the base discourse avatar url in the user avatar url', () => {
      expect(filteredComments.firstComments[0].avatar_url).toContain(BASE_AVATAR_URL)
    });

    it('should return a parsed list of the user comments with avatar, username, user comment, and comment date', () => {
      expect(filteredComments.firstComments[0].username).toBe('yemel')
      expect(filteredComments.firstComments[0].avatar_url).toBe('https://sea1.discourse-cdn.com/standard10/user_avatar/forum.decentraland.vote/yemel/45/1_2.png')
      expect(filteredComments.firstComments[0].created_at).toBe('2021-11-19T21:36:13.181Z')
      expect(filteredComments.firstComments[0].cooked).toBe('<p>I am commenting as Yemel</p>')
    });

    it('should only retrieve the user comment ', () => {
      filteredComments.firstComments.map(comment => expect(comment.username).not.toEqual(DISCOURSE_USER))
    });
  });

  describe('when there are more than three user comments on a discourse topic', () => {
    beforeAll(() => {
      posts = SEVERAL_USERS_POST
    })

    it('should return the total amount of user comments', () => {
      expect(filteredComments.totalComments).toBe(4)
    });

    it('should only retrieve the first three comments ', () => {
      expect(filteredComments.firstComments.length).toBe(3)
      expect(filteredComments.firstComments[0].created_at).toEqual('2021-11-19T21:36:13.181Z')
    });

    describe('when there is a user without an avatar defined in the forum', () => {
      it('should use the forum generic letter avatar in size 45', () => {
        expect(filteredComments.firstComments[2].avatar_url).toBe("https://avatars.discourse-cdn.com/v4/letter/n/b782af/45.png")
      });
    });
  })

  describe('when there are no comments on a post', () => {
    beforeAll(() => {
      posts = []
    });
    it('should say there are no comments', () => {
      expect(filteredComments.totalComments).toBe(0)
    });
    it('returns an empty list', () => {
      expect(filteredComments.firstComments).toHaveLength(0)
    });
  });
})
