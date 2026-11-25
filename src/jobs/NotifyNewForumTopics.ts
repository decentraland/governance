import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import orderBy from 'lodash/orderBy'

import { Discourse } from '../clients/Discourse'
import { DISCORD_FORUM_TOPIC_CATEGORIES, DISCORD_SERVICE_ENABLED } from '../constants'
import { forumUrl } from '../entities/Proposal/utils'
import { DISCOURSE_API, DISCOURSE_USER, getAvatarUrl } from '../entities/User/utils'
import ForumTopicNotificationModel from '../models/ForumTopicNotification'
import { ErrorService, serializeError } from '../services/ErrorService'
import { DiscordService } from '../services/discord'
import { DiscourseTopicListItem } from '../shared/types/discourse'
import Time from '../utils/date/Time'
import { ErrorCategory } from '../utils/errorCategories'
import logger from '../utils/logger'

// Only topics this recent are announced. It bounds what the first run, or a run after an outage,
// posts at once, while leaving room for topics that only appear once a moderator approves them.
export const FORUM_TOPIC_LOOKBACK = Time.Day
// Brand new forum accounts (trust level 0) can open topics, so they are not announced
export const MIN_FORUM_TOPIC_TRUST_LEVEL = 1
// A burst of topics is spread over later runs instead of flooding the channel
export const MAX_FORUM_TOPICS_PER_RUN = 3
// A failed fetch is caught up by a later run within FORUM_TOPIC_LOOKBACK, so a category is only reported once it
// has kept failing this long.
export const FORUM_FETCH_REPORT_AFTER = Time.Hour
// Failures further apart than this are separate blips rather than one outage: under the job lock, another instance
// may have run, and succeeded, in between.
export const FORUM_FETCH_FAILURE_GAP = 30 * Time.Minute

// Per process: when each category started failing, when it last failed, and whether that was reported. Any
// instance can win a run under the job lock, so with several replicas an outage can be reported once by each, an
// instance that keeps losing the lock starts its window over, and a deploy clears it. None of that loses topics,
// with a day of lookback, and keeping it in memory avoids a table for what is an alerting heuristic.
const fetchFailures = new Map<number, { since: number; last: number; reported: boolean }>()

// For tests, which run the job many times in one process.
export function resetForumFetchFailures() {
  fetchFailures.clear()
}

// Reported once per outage. The runs after that only log, until a fetch succeeds and the record is cleared.
function recordFetchFailure(categoryId: number, error: unknown) {
  const now = Date.now()
  const previous = fetchFailures.get(categoryId)
  const ongoing = previous && now - previous.last <= FORUM_FETCH_FAILURE_GAP ? previous : undefined
  const since = ongoing?.since ?? now
  const shouldReport = !ongoing?.reported && now - since >= FORUM_FETCH_REPORT_AFTER
  fetchFailures.set(categoryId, { since, last: now, reported: !!ongoing?.reported || shouldReport })
  if (shouldReport) {
    ErrorService.report('Error fetching latest forum topics', {
      categoryId,
      failingForMinutes: Math.round((now - since) / Time.Minute),
      error,
      category: ErrorCategory.Discourse,
    })
  } else {
    logger.warn('Could not fetch latest forum topics, a later run will catch up', {
      categoryId,
      error: error instanceof Error ? serializeError(error) : error,
    })
  }
}

// Block elements separate words; inline ones (links, emphasis, mentions) sit inside them.
const BLOCK_TAG = /<\/?(p|br|div|li|ul|ol|h[1-6]|blockquote|pre|hr|table|tr|td|th)\b[^>]*>/gi
const HTML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeHtmlEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === '#') {
      const codePoint = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity
    }
    return HTML_ENTITIES[code.toLowerCase()] ?? entity
  })
}

// Discourse only serves the first post as rendered html. Quotes, link previews and image captions
// repeat other content rather than say anything new, so they are dropped before the tags.
export function toPlainText(cookedHtml: string) {
  const text = cookedHtml
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<div class="meta">[\s\S]*?<\/div>/gi, ' ')
    .replace(BLOCK_TAG, ' ')
    .replace(/<[^>]+>/g, '')
  return decodeHtmlEntities(text).replace(/\s+/g, ' ').trim()
}

function forumProfileUrl(username: string) {
  const target = new URL(DISCOURSE_API)
  target.pathname = `/u/${encodeURIComponent(username)}`
  return target.toString()
}

async function getRecentTopics(categoryIds: number[]) {
  const since = Date.now() - FORUM_TOPIC_LOOKBACK
  const topics: DiscourseTopicListItem[] = []
  for (const categoryId of categoryIds) {
    try {
      const { topic_list } = await Discourse.get().getLatestTopicsInCategory(categoryId)
      topics.push(
        ...topic_list.topics.filter(
          (topic) => topic.category_id === categoryId && topic.visible && new Date(topic.created_at).getTime() >= since
        )
      )
      // Only once the response has been read: a 200 without a topic list is a failure too.
      fetchFailures.delete(categoryId)
    } catch (error) {
      // One category failing to load must not hold back the others.
      recordFetchFailure(categoryId, error)
    }
  }

  // Oldest first, so the channel reads in the order the topics were posted.
  return orderBy(topics, (topic) => new Date(topic.created_at).getTime(), 'asc')
}

async function announceTopic(topic: DiscourseTopicListItem) {
  try {
    const { details, post_stream, slug, title } = await Discourse.get().getTopic(topic.id)
    const author = details.created_by
    // The governance app opens a forum topic for every proposal and project update, and those are
    // announced in the channel as new proposals and updates already.
    if (author.username.toLowerCase() === DISCOURSE_USER.toLowerCase()) {
      return false
    }

    const firstPost = post_stream.posts.find((post) => post.post_number === 1)
    if (
      !firstPost ||
      firstPost.hidden ||
      firstPost.deleted_at ||
      (!firstPost.staff && firstPost.trust_level < MIN_FORUM_TOPIC_TRUST_LEVEL)
    ) {
      return false
    }

    const { category } = await Discourse.get().getCategory(topic.category_id)
    await DiscordService.newForumTopic({
      url: forumUrl(slug, topic.id),
      title,
      category: category.name,
      author: {
        username: author.username,
        avatarUrl: getAvatarUrl(author),
        profileUrl: forumProfileUrl(author.username),
      },
      preview: toPlainText(firstPost.cooked),
    })
    return true
  } catch (error) {
    ErrorService.report('Error announcing new forum topic', {
      topicId: topic.id,
      error: `${error}`,
      category: ErrorCategory.Discord,
    })
    try {
      await ForumTopicNotificationModel.release(topic.id)
    } catch (releaseError) {
      // Left claimed, the topic is skipped rather than retried. Missing one beats posting it twice.
      ErrorService.report('Error releasing forum topic announcement', {
        topicId: topic.id,
        error: `${releaseError}`,
        category: ErrorCategory.Job,
      })
    }
    return false
  }
}

// Announces each new topic in the configured forum categories once in the governance channel. Nothing
// is claimed while discord is off, so turning it on later still announces the recent topics.
export async function notifyNewForumTopics(context: JobContext) {
  if (!DISCORD_SERVICE_ENABLED || DISCORD_FORUM_TOPIC_CATEGORIES.length === 0) {
    return
  }

  try {
    const topics = await getRecentTopics(DISCORD_FORUM_TOPIC_CATEGORIES)
    const claimed = new Set(await ForumTopicNotificationModel.claim(topics))
    let announced = 0
    for (const topic of topics.filter(({ id }) => claimed.has(id))) {
      if (announced >= MAX_FORUM_TOPICS_PER_RUN) {
        await ForumTopicNotificationModel.release(topic.id)
        continue
      }
      if (await announceTopic(topic)) {
        announced++
      }
    }
    if (announced > 0) {
      context.log(`Announced ${announced} new forum topics...`)
    }
  } catch (error) {
    ErrorService.report('Error announcing new forum topics', { error, category: ErrorCategory.Job })
  }
}
