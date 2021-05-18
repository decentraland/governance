import API from "decentraland-gatsby/dist/utils/api/API";

export type DiscourseAuth = {
  apiKey: string,
  apiUsername: string
}

/**
 * @see https://docs.discourse.org/#tag/Posts/paths/~1posts.json/post
 */
export type DiscourseNewPost = {
  /** Required if creating a new topic or new private message. */
  title?: string,

  /** Required if creating a new post. */
  topic_id?: number,

  /** Post content */
  raw: string,

  /** Optional if creating a new topic, and ignored if creating a new post. */
  category?: number,

  /** Required for private message, comma separated. */
  target_usernames?: string,
}

export type DiscourseUpdatePost = {
  id: number,
  raw: string,
  edit_reason?: string
}

export type DiscourseCloseTopic = {
  id: number,
  raw?: string,
  edit_reason?: string
}

export type DiscoursePost = {
  id: number,
  name: string,
  username: string,
  avatar_template: string,
  created_at: string,
  cooked: string,
  post_number: number,
  post_type: number,
  updated_at: string,
  reply_count: number,
  reply_to_post_number: string,
  quote_count: number,
  incoming_link_count: number,
  reads: number,
  readers_count: number,
  score: number,
  yours: boolean,
  topic_id: number,
  topic_slug: string,
  display_username: string,
  primary_group_name: string,
  primary_group_flair_url: string,
  primary_group_flair_bg_color: string,
  primary_group_flair_color: string,
  version: number,
  can_edit: boolean,
  can_delete: boolean,
  can_recover: boolean,
  can_wiki: boolean,
  user_title: string,
  actions_summary:{
    id: number,
    can_act: boolean
  }[],
  moderator: boolean,
  admin: boolean,
  staff: boolean,
  user_id: number,
  draft_sequence: number,
  hidden: boolean,
  trust_level: number,
  deleted_at: string,
  user_deleted: boolean,
  edit_reason: string,
  can_view_edit_history: boolean,
  wiki: boolean,
  reviewable_id: string,
  reviewable_score_count: number,
  reviewable_score_pending_count: number
}

export class Discourse extends API {

  static Url = (
    process.env.GATSBY_DISCOURSE_API ||
    process.env.REACT_APP_DISCOURSE_API ||
    process.env.STORYBOOK_DISCOURSE_API ||
    process.env.DISCOURSE_API ||
    'https://meta.discourse.org/'
  )

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
      options =  options
        .header('Api-Key', auth.apiKey)
        .header('Api-Username', auth.apiUsername)
    }

    return this.fetch<DiscoursePost>(`/posts/${id}.json`, options)
  }

  async getLatestPosts(auth?: DiscourseAuth) {
    let options = this.options()

    if (auth?.apiKey && auth?.apiUsername) {
      options =  options
        .header('Api-Key', auth.apiKey)
        .header('Api-Username', auth.apiUsername)
    }

    return this.fetch<{ latest_posts: DiscoursePost[] }>(`/posts.json`, options)
  }

  async createPost(post: DiscourseNewPost, auth: DiscourseAuth) {
    if (!auth.apiKey || !auth.apiUsername) {
      throw new Error(`Invalid auth param: ${JSON.stringify(auth)}`)
    }

    return this.fetch<DiscoursePost>(`/posts.json`, this.options()
      .method('POST')
      .header('Api-Key', auth.apiKey)
      .header('Api-Username', auth.apiUsername)
      .json(post)
    )
  }

  async updatePost( { id , ...update }: DiscourseUpdatePost, auth: DiscourseAuth) {
    return this.fetch<DiscoursePost>(`/posts/${id}.json`, this.options()
      .method('PUT')
      .header('Api-Key', auth.apiKey)
      .header('Api-Username', auth.apiUsername)
      .json(update)
    )
  }

  async closeTopic({ id, ...update }: DiscourseCloseTopic, auth: DiscourseAuth) {
    if (!update.raw) {

    }

    return this.fetch<{}>(`/t/${id}/status.json`, this.options()
      .method('PUT')
      .header('Api-Key', auth.apiKey)
      .header('Api-Username', auth.apiUsername)
      .json({
        status: 'closed',
        enabled: 'true'
      })
    )
  }

  async removeTopic(id: number, auth: DiscourseAuth) {
    return this.fetch<{}>(`/t/${id}.json`, this.options()
      .method('DELETE')
      .header('Api-Key', auth.apiKey)
      .header('Api-Username', auth.apiUsername)
    )
  }

}