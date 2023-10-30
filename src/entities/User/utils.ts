import { hashMessage, recoverAddress } from 'ethers/lib/utils'

import { DiscoursePostInTopic } from '../../clients/Discourse'
import { FORUM_URL } from '../../constants'
import { clientEnv } from '../../utils/clientEnv'
import { ProposalComment, ProposalCommentsInDiscourse } from '../Proposal/types'
import { isSameAddress } from '../Snapshot/utils'

import { MESSAGE_TIMEOUT_TIME } from './constants'
import { ValidatedAccount, ValidationComment } from './types'

export const DISCOURSE_USER = process.env.GATSBY_DISCOURSE_USER || clientEnv('GATSBY_DISCOURSE_USER') || ''
export const DISCOURSE_API = process.env.GATSBY_DISCOURSE_API || clientEnv('GATSBY_DISCOURSE_API') || ''
const DEFAULT_AVATAR_SIZE = '45'

function getDefaultAvatarSizeUrl(avatar_url: string) {
  return avatar_url.replace('{size}', DEFAULT_AVATAR_SIZE)
}

function getAvatarUrl(post: DiscoursePostInTopic) {
  const defaultSizeUrl = getDefaultAvatarSizeUrl(post.avatar_template)
  return defaultSizeUrl.includes('letter') ? defaultSizeUrl : FORUM_URL + defaultSizeUrl
}

export function filterComments(
  posts: DiscoursePostInTopic[],
  validatedAccounts?: ValidatedAccount[]
): ProposalCommentsInDiscourse {
  const userPosts = posts.filter(
    (post) => ![DISCOURSE_USER.toLowerCase(), 'system'].includes(post.username.toLowerCase())
  )

  let proposalComments: ProposalComment[] = userPosts.map((post) => {
    return {
      user_forum_id: post.user_id,
      username: post.username,
      avatar_url: getAvatarUrl(post),
      created_at: post.created_at,
      cooked: post.cooked,
    }
  })

  if (validatedAccounts !== undefined && validatedAccounts.length > 0) {
    const forumIdToAddressMap = validatedAccounts.reduce((map, user) => {
      map[user.forum_id] = user.address
      return map
    }, {} as Record<number, string>)

    proposalComments = proposalComments.map((comment) => {
      comment.address = forumIdToAddressMap[comment.user_forum_id]
      return comment
    })
  }

  return {
    totalComments: proposalComments.length,
    comments: proposalComments,
  }
}

export function formatValidationMessage(address: string, timestamp: string, account?: string) {
  return `By signing and posting this message I'm linking my Decentraland DAO account ${address} with this ${
    account ? `${account} ` : ''
  }account\n\nDate: ${timestamp}`
}

export function getValidationComment(comments: ValidationComment[], address: string, timestamp: string) {
  const timeWindow = new Date(new Date().getTime() - MESSAGE_TIMEOUT_TIME)

  const filteredComments = comments.filter((comment) => new Date(comment.timestamp) > timeWindow)

  return filteredComments.find((comment) => {
    const addressRegex = new RegExp(address, 'i')
    const dateRegex = new RegExp(timestamp, 'i')

    return addressRegex.test(comment.content) && dateRegex.test(comment.content)
  })
}

export function validateComment(validationComment: ValidationComment, address: string, timestamp: string) {
  const signatureRegex = /0x([a-fA-F\d]{130})/
  const signature = '0x' + validationComment.content.match(signatureRegex)?.[1]
  const recoveredAddress = recoverAddress(hashMessage(formatValidationMessage(address, timestamp)), signature)

  return isSameAddress(recoveredAddress, address)
}
