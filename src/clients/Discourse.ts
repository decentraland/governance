import API from 'decentraland-gatsby/dist/utils/api/API'
import Options from 'decentraland-gatsby/dist/utils/api/Options'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

import { DISCOURSE_API, DISCOURSE_USER } from '../entities/User/utils'

import {
  DiscourseAuth,
  DiscourseCloseTopic,
  DiscourseComment,
  DiscourseNewPost,
  DiscoursePost,
  DiscourseTopic,
  DiscourseUpdatePost,
  DiscourseUser,
} from './DiscourseTypes'
import { trimLastForwardSlash } from './utils'

export class Discourse extends API {
  static Url = DISCOURSE_API || 'https://meta.discourse.org/'

  static Cache = new Map<string, Discourse>()
  private readonly auth: DiscourseAuth

  static from(baseUrl: string) {
    baseUrl = trimLastForwardSlash(baseUrl)
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(this.Url)
  }

  constructor(baseUrl: string) {
    super(baseUrl)
    this.auth = Discourse.getCredentials()
  }

  private static getCredentials() {
    const DISCOURSE_API_KEY = requiredEnv('DISCOURSE_API_KEY')
    if (!DISCOURSE_USER) {
      throw new Error('Failed to determine discourse user. Please check DISCOURSE_USER env is defined')
    }
    const DISCOURSE_AUTH: DiscourseAuth = {
      apiKey: DISCOURSE_API_KEY,
      apiUsername: DISCOURSE_USER,
    }
    return DISCOURSE_AUTH
  }

  private withAuth(options: Options) {
    return options.header('Api-Key', this.auth.apiKey).header('Api-Username', this.auth.apiUsername)
  }

  async getPost(id: number) {
    let options: Options = this.options()
    options = this.withAuth(options)
    return this.fetch<DiscoursePost>(`/posts/${id}.json`, options)
  }

  async getLatestPosts() {
    let options = this.options()
    options = this.withAuth(options)

    return this.fetch<{ latest_posts: DiscoursePost[] }>(`/posts.json`, options)
  }

  async createPost(post: DiscourseNewPost) {
    return this.fetch<DiscoursePost>(`/posts.json`, this.withAuth(this.options().method('POST').json(post)))
  }

  async commentOnPost(post: DiscourseComment) {
    return this.fetch<DiscoursePost>(`/posts.json`, this.withAuth(this.options().method('POST').json(post)))
  }

  async updatePost({ id, ...update }: DiscourseUpdatePost) {
    return this.fetch<DiscoursePost>(`/posts/${id}.json`, this.withAuth(this.options().method('PUT').json(update)))
  }

  async closeTopic({ id }: DiscourseCloseTopic) {
    return this.fetch<Record<string, unknown>>(
      `/t/${id}/status.json`,
      this.withAuth(
        this.options().method('PUT').json({
          status: 'closed',
          enabled: 'true',
        })
      )
    )
  }

  async removeTopic(id: number) {
    return this.fetch<Record<string, unknown>>(`/t/${id}.json`, this.withAuth(this.options().method('DELETE')))
  }

  async getTopic(topic_id: number) {
    return this.fetch<DiscourseTopic>(`/t/${topic_id}.json`, this.withAuth(this.options().method('GET')))
  }

  async getPosts(topic_id: number, postIds: number[]) {
    let query = '?'
    postIds.forEach((id, index) => {
      if (index > 0) query = query.concat('&')
      query = query.concat('post_ids[]=' + id)
    })
    return this.fetch<Pick<DiscourseTopic, 'post_stream' | 'id'>>(
      `/t/${topic_id}/posts.json` + query,
      this.withAuth(this.options().method('GET'))
    )
  }

  async getUserById(id: number) {
    return this.fetch<DiscourseUser>(`/admin/users/${id}.json`, this.withAuth(this.options().method('GET')))
  }
}
