import env, { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { DiscourseAuth, DiscourseTopic, DiscoursePostInTopic } from '../../api/Discourse'
import { ProposalComment } from '../Proposal/types'

export const DISCOURSE_API = requiredEnv('DISCOURSE_API')
export const DISCOURSE_URL = env('DISCOURSE_URL', DISCOURSE_API)
export const DISCOURSE_API_KEY = requiredEnv('DISCOURSE_API_KEY')
export const DISCOURSE_CATEGORY = requiredEnv('DISCOURSE_CATEGORY')
export const DISCOURSE_USER = requiredEnv('DISCOURSE_USER')
export const DISCOURSE_AUTH: DiscourseAuth = {
  apiKey: DISCOURSE_API_KEY,
  apiUsername: DISCOURSE_USER
}
export const BASE_AVATAR_URL = requiredEnv('DISCOURSE_BASE_AVATAR_URL')
const DEFAULT_AVATAR_SIZE = '45'

function getDefaultAvatarSizeUrl(avatar_url: string) {
  return avatar_url.replace('{size}', DEFAULT_AVATAR_SIZE)
}

function setAvatarUrl(post: DiscoursePostInTopic) {
  let defaultSizeUrl = getDefaultAvatarSizeUrl(post.avatar_template)
  return defaultSizeUrl.includes('letter') ? defaultSizeUrl : BASE_AVATAR_URL + defaultSizeUrl
}

export function filterComments(comments: DiscourseTopic) {
  const posts = comments.post_stream.posts
  const userPosts: DiscoursePostInTopic[] = posts.filter((post) =>
    ![DISCOURSE_USER.toLowerCase(), 'system'].includes(post.username.toLowerCase()))
    .slice(-3)
  const discourseComments: ProposalComment[] = userPosts.map(post => {
    return {
      username: post.username,
      avatar_url: setAvatarUrl(post),
      created_at: post.created_at,
      cooked: post.cooked
    }
  })
  return discourseComments
}
