import API from 'decentraland-gatsby/dist/utils/api/API'

import { DISCOURSE_AUTH } from '../entities/Discourse/utils'

export type DiscourseAuth = {
  apiKey: string
  apiUsername: string
}

/**
 * @see https://docs.discourse.org/#tag/Posts/paths/~1posts.json/post
 */
export type DiscourseNewPost = {
  /** Required if creating a new topic or new private message. */
  title?: string

  /** Required if creating a new post. */
  topic_id?: number

  /** Post content */
  raw: string

  /** Optional if creating a new topic, and ignored if creating a new post. */
  category?: number

  /** Required for private message, comma separated. */
  target_usernames?: string
}

export type DiscourseUpdatePost = {
  id: number
  raw: string
  edit_reason?: string
}

export type DiscourseCloseTopic = {
  id: number
  raw?: string
  edit_reason?: string
}

export type DiscoursePost = {
  id: number
  name: string
  username: string
  avatar_template: string
  created_at: string
  cooked: string
  post_number: number
  post_type: number
  updated_at: string
  reply_count: number
  reply_to_post_number: string
  quote_count: number
  incoming_link_count: number
  reads: number
  readers_count: number
  score: number
  yours: boolean
  topic_id: number
  topic_slug: string
  display_username: string
  primary_group_name: string
  primary_group_flair_url: string
  primary_group_flair_bg_color: string
  primary_group_flair_color: string
  version: number
  can_edit: boolean
  can_delete: boolean
  can_recover: boolean
  can_wiki: boolean
  user_title: string
  actions_summary: {
    id: number
    can_act: boolean
  }[]
  moderator: boolean
  admin: boolean
  staff: boolean
  user_id: number
  draft_sequence: number
  hidden: boolean
  trust_level: number
  deleted_at: string
  user_deleted: boolean
  edit_reason: string
  can_view_edit_history: boolean
  wiki: boolean
  reviewable_id: string
  reviewable_score_count: number
  reviewable_score_pending_count: number
}

export type DiscourseComment = {
  topic_id: number
  raw: string
  created_at: string
}

export type DiscourseTopic = {
  chunk_size: number
  deleted_by: null
  slow_mode_enabled_until: null
  post_stream: {
    stream: number[]
    posts: DiscoursePostInTopic[]
  }
  timeline_lookup: number[][]
  bookmarks: any[]
  fancy_title: string
  actions_summary: any[]
  draft: null
  draft_sequence: number
  draft_key: string
  details: {
    last_poster: {
      name: string
      id: number
      avatar_template: string
      username: string
    }
    can_reply_as_new_topic: boolean
    can_invite_to: boolean
    can_edit: boolean
    notification_level: number
    can_create_post: boolean
    can_flag_topic: boolean
    created_by: {
      name: string
      id: number
      avatar_template: string
      username: string
    }
    participants: (
      | {
        flair_color: null
        moderator: boolean
        admin: boolean
        trust_level: number
        flair_url: null
        flair_bg_color: null
        primary_group_name: null
        name: string
        id: number
        post_count: number
        avatar_template: string
        flair_name: null
        username: string
      }
      | {
        flair_bg_color: null
        primary_group_name: null
        flair_color: null
        name: string
        admin: boolean
        trust_level: number
        id: number
        post_count: number
        flair_url: null
        avatar_template: string
        flair_name: null
        username: string
      }
    )[]
  }
  id: number
  slug: string
  like_count: number
  visible: boolean
  image_url: string
  reply_count: number
  deleted_at: null
  tags: any[]
  show_read_indicator: boolean
  user_id: number
  pinned_until: null
  highest_post_number: number
  unpinned: null
  pinned: boolean
  suggested_topics: any[]
  current_post_number: number
  featured_link: null
  created_at: string
  topic_timer: null
  title: string
  slow_mode_seconds: number
  archived: boolean
  has_summary: boolean
  word_count: number
  category_id: number
  pinned_at: null
  tags_disable_ads: boolean
  views: number
  last_posted_at: string
  message_bus_last_id: number
  bookmarked: boolean | null
  pinned_globally: boolean
  archetype: string
  participant_count: number
  closed: boolean
  thumbnails: {
    max_width: null
    width: number
    max_height: null
    url: string
    height: number
  }[]
  posts_count: number
}

export type DiscoursePostInTopic = {
  id: number
  name: string
  username: string
  avatar_template: string
  created_at: string
  cooked: string
  post_number: number
  post_type: number
  updated_at: string
  reply_count: number
  reply_to_post_number: number | null
  reply_to_user?: any
  user_created_at: string
  user_date_of_birth: string | null
  quote_count: number
  incoming_link_count: number
  reads: number
  readers_count: number
  score: number
  yours: boolean
  topic_id: number
  topic_slug: string
  display_username: string
  primary_group_name: string | null
  flair_name: string | null
  flair_url: string | null
  flair_bg_color: string | null
  flair_color: string | null
  version: number
  can_edit: boolean
  can_delete: boolean
  can_recover: boolean
  can_wiki: boolean
  link_counts?: any[]
  read: boolean
  user_title: string | null
  bookmarked: boolean | null
  actions_summary: any[]
  moderator: boolean
  admin: boolean
  staff: boolean
  user_id: number
  hidden: boolean
  trust_level: number
  deleted_at: string | null
  user_deleted: boolean
  edit_reason: string | null
  can_view_edit_history: boolean
  can_accept_answer: boolean
  can_unaccept_answer: boolean
  accepted_answer: boolean
  wiki: boolean
  reviewable_id?: number
  reviewable_score_count?: number
  reviewable_score_pending_count?: number
}

export class Discourse extends API {
  static Url =
    process.env.GATSBY_DISCOURSE_API ||
    process.env.REACT_APP_DISCOURSE_API ||
    process.env.STORYBOOK_DISCOURSE_API ||
    process.env.DISCOURSE_API ||
    'https://meta.discourse.org/'

  static Cache = new Map<string, Discourse>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(this.Url)
  }

  async getPost(id: number, auth?: DiscourseAuth) {
    let options = this.options()

    if (auth?.apiKey && auth?.apiUsername) {
      options = options.header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername)
    }

    return this.fetch<DiscoursePost>(`/posts/${id}.json`, options)
  }

  async getLatestPosts(auth?: DiscourseAuth) {
    let options = this.options()

    if (auth?.apiKey && auth?.apiUsername) {
      options = options.header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername)
    }

    return this.fetch<{ latest_posts: DiscoursePost[] }>(`/posts.json`, options)
  }

  async createPost(post: DiscourseNewPost, auth: DiscourseAuth) {
    Discourse.checkCredentials(auth)

    return this.fetch<DiscoursePost>(
      `/posts.json`,
      this.options().method('POST').header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername).json(post)
    )
  }

  private static checkCredentials(auth: DiscourseAuth) {
    if (!auth.apiKey || !auth.apiUsername) {
      throw new Error(`Invalid auth param: ${JSON.stringify(auth)}`)
    }
  }

  async commentOnPost(post: DiscourseComment, auth: DiscourseAuth) {
    Discourse.checkCredentials(auth)

    return this.fetch<DiscoursePost>(
      `/posts.json`,
      this.options().method('POST').header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername).json(post)
    )
  }

  async updatePost({ id, ...update }: DiscourseUpdatePost, auth: DiscourseAuth) {
    return this.fetch<DiscoursePost>(
      `/posts/${id}.json`,
      this.options().method('PUT').header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername).json(update)
    )
  }

  async closeTopic({ id, ...update }: DiscourseCloseTopic, auth: DiscourseAuth) {
    if (!update.raw) {
    }

    return this.fetch<{}>(
      `/t/${id}/status.json`,
      this.options().method('PUT').header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername).json({
        status: 'closed',
        enabled: 'true',
      })
    )
  }

  async removeTopic(id: number, auth: DiscourseAuth) {
    return this.fetch<{}>(
      `/t/${id}.json`,
      this.options().method('DELETE').header('Api-Key', auth.apiKey).header('Api-Username', auth.apiUsername)
    )
  }

  async getTopic(topic_id: number) {
    return this.fetch<DiscourseTopic>(
      `/t/${topic_id}.json`,
      this.options()
        .method('GET')
        .header('Api-Key', DISCOURSE_AUTH.apiKey)
        .header('Api-Username', DISCOURSE_AUTH.apiUsername)
    )
  }
}
