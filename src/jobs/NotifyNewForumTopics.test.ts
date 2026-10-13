import type JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import type { Discourse } from '../clients/Discourse'
import type { DiscourseTopic, DiscourseTopicListItem } from '../shared/types/discourse'

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
  DISCORD_FORUM_TOPIC_CATEGORIES: [13, 18],
}))

jest.mock('decentraland-server')
jest.mock('@pushprotocol/restapi/src/index.js', () => jest.fn())

// Read into module constants at import time, so set before the requires below.
process.env.GATSBY_DISCOURSE_API = 'https://forum.decentraland.org'
process.env.GATSBY_DISCOURSE_USER = 'dao'

/* eslint-disable @typescript-eslint/no-var-requires */
const { Discourse: DiscourseClient } = require('../clients/Discourse')
const { default: ForumTopicNotificationModel } = require('../models/ForumTopicNotification')
const { ErrorService } = require('../services/ErrorService')
const { DiscordService } = require('../services/discord')
const {
  FORUM_TOPIC_LOOKBACK,
  MAX_FORUM_TOPICS_PER_RUN,
  notifyNewForumTopics,
  toPlainText,
} = require('./NotifyNewForumTopics')
/* eslint-enable @typescript-eslint/no-var-requires */

// The job reads these when it runs, so changing them on the mocked module is enough.
const constants = jest.requireMock('../constants') as {
  DISCORD_SERVICE_ENABLED: boolean
  DISCORD_FORUM_TOPIC_CATEGORIES: number[]
}

const CATEGORY_NAMES: Record<number, string> = { 13: 'Governance', 18: 'DCL Regenesis Labs' }

function listItem(id: number, categoryId: number, ageMs: number, overrides: Partial<DiscourseTopicListItem> = {}) {
  return {
    id,
    title: `Topic ${id}`,
    slug: `topic-${id}`,
    created_at: new Date(Date.now() - ageMs).toISOString(),
    category_id: categoryId,
    visible: true,
    ...overrides,
  }
}

function topicDetails(
  id: number,
  username: string,
  cooked = `<p>Body of topic ${id}</p>`,
  post: { trust_level?: number; hidden?: boolean } = {}
) {
  return {
    id,
    slug: `topic-${id}`,
    title: `Topic ${id}`,
    details: {
      created_by: {
        id: 1,
        name: '',
        username,
        avatar_template: `/user_avatar/forum.decentraland.org/${username.toLowerCase()}/{size}/1_2.png`,
      },
    },
    post_stream: { stream: [1], posts: [{ post_number: 1, cooked, trust_level: 1, hidden: false, ...post }] },
  } as unknown as DiscourseTopic
}

function createContext() {
  return { log: jest.fn() } as unknown as JobContext
}

describe('notifyNewForumTopics', () => {
  let latestByCategory: Record<number, DiscourseTopicListItem[]>
  let topicsById: Record<number, DiscourseTopic>
  let getLatestTopicsInCategory: jest.Mock
  let getTopic: jest.Mock
  let claim: jest.SpyInstance
  let release: jest.SpyInstance
  let newForumTopic: jest.SpyInstance
  let report: jest.SpyInstance

  beforeEach(() => {
    constants.DISCORD_SERVICE_ENABLED = true
    constants.DISCORD_FORUM_TOPIC_CATEGORIES = [13, 18]
    latestByCategory = { 13: [], 18: [] }
    topicsById = {}

    getLatestTopicsInCategory = jest.fn(async (categoryId: number) => ({
      topic_list: { topics: latestByCategory[categoryId] },
    }))
    getTopic = jest.fn(async (id: number) => topicsById[id])
    const getCategory = jest.fn(async (id: number) => ({ category: { id, name: CATEGORY_NAMES[id], slug: 'slug' } }))
    jest
      .spyOn(DiscourseClient, 'get')
      .mockReturnValue({ getLatestTopicsInCategory, getTopic, getCategory } as unknown as Discourse)

    // Claims everything it is given, as it would for topics nobody has announced yet.
    claim = jest
      .spyOn(ForumTopicNotificationModel, 'claim')
      .mockImplementation(async (topics) => (topics as DiscourseTopicListItem[]).map(({ id }) => id))
    release = jest.spyOn(ForumTopicNotificationModel, 'release').mockResolvedValue(1)
    newForumTopic = jest.spyOn(DiscordService, 'newForumTopic').mockResolvedValue(undefined)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // A claim taken while nothing can be posted would use up the announcement for good.
  describe('when discord is disabled', () => {
    beforeEach(async () => {
      constants.DISCORD_SERVICE_ENABLED = false
      await notifyNewForumTopics(createContext())
    })

    it('should not read the forum', () => {
      expect(getLatestTopicsInCategory).not.toHaveBeenCalled()
    })
  })

  describe('when no category is configured', () => {
    beforeEach(async () => {
      constants.DISCORD_FORUM_TOPIC_CATEGORIES = []
      await notifyNewForumTopics(createContext())
    })

    it('should not read the forum', () => {
      expect(getLatestTopicsInCategory).not.toHaveBeenCalled()
    })
  })

  describe('when the categories have recent and old topics', () => {
    let context: JobContext

    beforeEach(async () => {
      latestByCategory[13] = [
        listItem(103, 13, 10 * 60 * 1000),
        listItem(102, 13, FORUM_TOPIC_LOOKBACK + 60 * 1000),
        listItem(101, 13, 20 * 60 * 1000, { visible: false }),
      ]
      latestByCategory[18] = [listItem(201, 18, 30 * 60 * 1000), listItem(301, 19, 5 * 60 * 1000)]
      topicsById[103] = topicDetails(103, 'Nacho')
      topicsById[201] = topicDetails(201, 'ginoct')
      context = createContext()
      await notifyNewForumTopics(context)
    })

    it('should read the latest topics of every configured category', () => {
      expect(getLatestTopicsInCategory.mock.calls).toEqual([[13], [18]])
    })

    // Older ones were either announced already or predate the job; unlisted ones are not public; and
    // a subcategory's topics only count when the subcategory is configured itself.
    it('should claim only the recent, visible topics of those categories, oldest first', () => {
      expect(claim.mock.calls[0][0].map(({ id }: DiscourseTopicListItem) => id)).toEqual([201, 103])
    })

    it('should announce them in the order they were posted', () => {
      expect(newForumTopic.mock.calls.map(([announcement]) => announcement.title)).toEqual(['Topic 201', 'Topic 103'])
    })

    it('should log how many were announced', () => {
      expect(context.log).toHaveBeenCalledWith('Announced 2 new forum topics...')
    })
  })

  describe('when announcing a topic', () => {
    beforeEach(async () => {
      latestByCategory[18] = [listItem(25456, 18, 10 * 60 * 1000)]
      topicsById[25456] = topicDetails(
        25456,
        'DCLRegenesisLabs',
        '<p>The handover is <strong>complete</strong> &amp; final.</p>'
      )
      await notifyNewForumTopics(createContext())
    })

    it('should describe it with its link, title, category, author and a plain text preview', () => {
      expect(newForumTopic).toHaveBeenCalledWith({
        url: 'https://forum.decentraland.org/t/topic-25456/25456',
        title: 'Topic 25456',
        category: 'DCL Regenesis Labs',
        author: {
          username: 'DCLRegenesisLabs',
          avatarUrl: 'https://forum.decentraland.org/user_avatar/forum.decentraland.org/dclregenesislabs/45/1_2.png',
          profileUrl: 'https://forum.decentraland.org/u/DCLRegenesisLabs',
        },
        preview: 'The handover is complete & final.',
      })
    })
  })

  // The governance app opens these for proposals and project updates, which are announced already.
  describe('when a topic was opened by the governance forum account', () => {
    beforeEach(async () => {
      latestByCategory[13] = [listItem(25427, 13, 10 * 60 * 1000)]
      topicsById[25427] = topicDetails(25427, 'DAO')
      await notifyNewForumTopics(createContext())
    })

    it('should not announce it', () => {
      expect(newForumTopic).not.toHaveBeenCalled()
    })

    it('should keep it claimed so it is not looked at again', () => {
      expect(release).not.toHaveBeenCalled()
    })
  })

  describe('when a topic was opened by a brand new forum account', () => {
    beforeEach(async () => {
      latestByCategory[13] = [listItem(301, 13, 10 * 60 * 1000)]
      topicsById[301] = topicDetails(301, 'airdrop', undefined, { trust_level: 0 })
      await notifyNewForumTopics(createContext())
    })

    it('should not announce it, and keep it claimed', () => {
      expect(newForumTopic).not.toHaveBeenCalled()
      expect(release).not.toHaveBeenCalled()
    })
  })

  describe('when the first post of a topic was hidden by moderators', () => {
    beforeEach(async () => {
      latestByCategory[13] = [listItem(302, 13, 10 * 60 * 1000)]
      topicsById[302] = topicDetails(302, 'Nacho', undefined, { hidden: true })
      await notifyNewForumTopics(createContext())
    })

    it('should not announce it', () => {
      expect(newForumTopic).not.toHaveBeenCalled()
    })
  })

  describe('when more topics than the per-run cap are new', () => {
    const ids = [400, 401, 402, 403, 404]

    beforeEach(async () => {
      latestByCategory[13] = ids.map((id, index) => listItem(id, 13, (60 - index) * 60 * 1000))
      ids.forEach((id) => (topicsById[id] = topicDetails(id, 'Nacho')))
      await notifyNewForumTopics(createContext())
    })

    it('should announce the oldest up to the cap and hand the rest back for the next run', () => {
      expect(newForumTopic.mock.calls.map(([announcement]) => announcement.title)).toEqual(
        ids.slice(0, MAX_FORUM_TOPICS_PER_RUN).map((id) => `Topic ${id}`)
      )
      expect(release.mock.calls.map(([id]) => id)).toEqual(ids.slice(MAX_FORUM_TOPICS_PER_RUN))
    })
  })

  describe('when a topic was already claimed by an earlier run or another instance', () => {
    beforeEach(async () => {
      latestByCategory[13] = [listItem(103, 13, 10 * 60 * 1000), listItem(104, 13, 5 * 60 * 1000)]
      topicsById[103] = topicDetails(103, 'Nacho')
      topicsById[104] = topicDetails(104, 'Tobik')
      claim.mockResolvedValue([104])
      await notifyNewForumTopics(createContext())
    })

    it('should announce only the topic claimed now', () => {
      expect(newForumTopic.mock.calls.map(([announcement]) => announcement.title)).toEqual(['Topic 104'])
    })
  })

  describe('when one category cannot be read', () => {
    beforeEach(async () => {
      latestByCategory[18] = [listItem(201, 18, 10 * 60 * 1000)]
      topicsById[201] = topicDetails(201, 'ginoct')
      getLatestTopicsInCategory.mockRejectedValueOnce(new Error('HTTP error! status: 502'))
      await notifyNewForumTopics(createContext())
    })

    it('should report it', () => {
      expect(report).toHaveBeenCalledWith(
        'Error fetching latest forum topics',
        expect.objectContaining({ categoryId: 13 })
      )
    })

    it('should still announce the topics of the others', () => {
      expect(newForumTopic).toHaveBeenCalledTimes(1)
    })
  })

  describe('when posting one announcement fails', () => {
    let context: JobContext

    beforeEach(async () => {
      latestByCategory[13] = [listItem(103, 13, 10 * 60 * 1000), listItem(104, 13, 5 * 60 * 1000)]
      topicsById[103] = topicDetails(103, 'Nacho')
      topicsById[104] = topicDetails(104, 'Tobik')
      newForumTopic.mockRejectedValueOnce(new Error('Missing Access'))
      context = createContext()
      await notifyNewForumTopics(context)
    })

    it('should hand that topic back so the next run retries it', () => {
      expect(release.mock.calls).toEqual([[103]])
    })

    it('should still announce the rest', () => {
      expect(newForumTopic).toHaveBeenCalledTimes(2)
    })

    it('should report the failure', () => {
      expect(report).toHaveBeenCalledWith('Error announcing new forum topic', expect.objectContaining({ topicId: 103 }))
    })

    it('should count only the announcements that went out', () => {
      expect(context.log).toHaveBeenCalledWith('Announced 1 new forum topics...')
    })
  })

  describe('when the topic itself cannot be read', () => {
    beforeEach(async () => {
      latestByCategory[13] = [listItem(103, 13, 10 * 60 * 1000)]
      getTopic.mockRejectedValueOnce(new Error('HTTP error! status: 404'))
      await notifyNewForumTopics(createContext())
    })

    it('should hand it back for the next run', () => {
      expect(release).toHaveBeenCalledWith(103)
    })
  })

  describe('when handing a failed announcement back fails as well', () => {
    beforeEach(async () => {
      latestByCategory[13] = [listItem(103, 13, 10 * 60 * 1000)]
      topicsById[103] = topicDetails(103, 'Nacho')
      newForumTopic.mockRejectedValueOnce(new Error('Missing Access'))
      release.mockRejectedValueOnce(new Error('connection reset'))
      await notifyNewForumTopics(createContext())
    })

    it('should report it', () => {
      expect(report).toHaveBeenCalledWith(
        'Error releasing forum topic announcement',
        expect.objectContaining({ topicId: 103 })
      )
    })
  })

  describe('when claiming fails', () => {
    let claimError: Error

    beforeEach(async () => {
      latestByCategory[13] = [listItem(103, 13, 10 * 60 * 1000)]
      claimError = new Error('connection refused')
      claim.mockRejectedValue(claimError)
      await notifyNewForumTopics(createContext())
    })

    it('should report the failure instead of throwing', () => {
      expect(report).toHaveBeenCalledWith(
        'Error announcing new forum topics',
        expect.objectContaining({ error: claimError })
      )
    })

    it('should announce nothing', () => {
      expect(newForumTopic).not.toHaveBeenCalled()
    })
  })
})

describe('toPlainText', () => {
  describe('when the post has markup', () => {
    it('should keep only the text, with whitespace collapsed', () => {
      expect(
        toPlainText('<h2>Context</h2>\n<p>First <em>line</em>.</p>\n<ul>\n<li>one</li>\n<li>two</li>\n</ul>')
      ).toBe('Context First line. one two')
    })
  })

  // They repeat other content rather than say anything new.
  describe('when the post quotes another post or embeds a link preview', () => {
    it('should leave the quote and the preview out', () => {
      const html =
        '<aside class="quote"><div class="title">someone:</div><blockquote><p>quoted</p></blockquote></aside>' +
        '<p>Reply</p>' +
        '<aside class="onebox"><article>Preview of a link</article></aside>'
      expect(toPlainText(html)).toBe('Reply')
    })
  })

  describe('when the post has an image', () => {
    it('should leave its file name and size out', () => {
      const html =
        '<p><div class="lightbox-wrapper"><a class="lightbox"><img src="a.png"><div class="meta">' +
        '<span class="filename">image</span><span class="informations">1920×1080 120 KB</span></div></a></div></p>' +
        '<p>Caption</p>'
      expect(toPlainText(html)).toBe('Caption')
    })
  })

  describe('when the post has html entities', () => {
    it('should decode them', () => {
      expect(toPlainText('<p>Q&amp;A &lt;3 &quot;DAO&quot; it&#39;s &#x27;ok&#x27;&nbsp;now</p>')).toBe(
        `Q&A <3 "DAO" it's 'ok' now`
      )
    })
  })
})
