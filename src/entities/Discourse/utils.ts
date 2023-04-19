import { DiscoursePostInTopic } from '../../clients/Discourse'
import { FORUM_URL } from '../../constants'
import { env } from '../../modules/env'
import locations from '../../modules/locations'
import { ProposalComment, ProposalCommentsInDiscourse } from '../Proposal/types'

export const DISCOURSE_USER = process.env.GATSBY_DISCOURSE_USER || env('GATSBY_DISCOURSE_USER') || ''
export const DISCOURSE_API = process.env.GATSBY_DISCOURSE_API || env('GATSBY_DISCOURSE_API') || ''
const DEFAULT_AVATAR_SIZE = '45'

function getDefaultAvatarSizeUrl(avatar_url: string) {
  return avatar_url.replace('{size}', DEFAULT_AVATAR_SIZE)
}

export function getUserProfileUrl(user: string, address?: string) {
  return address ? locations.profile({ address }) : `${FORUM_URL}/u/${user}`
}

function getAvatarUrl(post: DiscoursePostInTopic) {
  const defaultSizeUrl = getDefaultAvatarSizeUrl(post.avatar_template)
  return defaultSizeUrl.includes('letter') ? defaultSizeUrl : FORUM_URL + defaultSizeUrl
}

export async function filterComments(posts: DiscoursePostInTopic[]): Promise<ProposalCommentsInDiscourse> {
  const userPosts = posts.filter(
    (post) => ![DISCOURSE_USER.toLowerCase(), 'system'].includes(post.username.toLowerCase())
  )

  const proposalComments: ProposalComment[] = userPosts.map((post) => {
    return {
      id: post.user_id,
      username: post.username,
      avatar_url: getAvatarUrl(post),
      created_at: post.created_at,
      cooked: post.cooked,
    }
  })

  return {
    totalComments: userPosts.length,
    comments: proposalComments,
  }
}
