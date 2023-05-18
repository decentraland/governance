import { hashMessage, recoverAddress } from 'ethers/lib/utils'

import { DiscoursePostInTopic } from '../../clients/Discourse'
import { FORUM_URL } from '../../constants'
import { env } from '../../modules/env'
import locations from '../../modules/locations'
import { ProposalComment, ProposalCommentsInDiscourse } from '../Proposal/types'
import { isSameAddress } from '../Snapshot/utils'

import { MESSAGE_TIMEOUT_TIME } from './constants'
import { ValidatedAccount } from './types'

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

export function formatValidationMessage(address: string, timestamp: string) {
  return `By signing and posting this message I'm linking my Decentraland DAO account ${address} with this Discourse forum account\n\nDate: ${timestamp}`
}

export function getValidationComment(comments: DiscoursePostInTopic[], address: string, timestamp: string) {
  const timeWindow = new Date(new Date().getTime() - MESSAGE_TIMEOUT_TIME)

  const filteredComments = comments.filter((comment) => new Date(comment.created_at) > timeWindow)

  return filteredComments.find((comment) => {
    const addressRegex = new RegExp(address, 'i')
    const dateRegex = new RegExp(timestamp, 'i')

    return addressRegex.test(comment.cooked) && dateRegex.test(comment.cooked)
  })
}

export function validateComment(validationComment: DiscoursePostInTopic, address: string, timestamp: string) {
  const signatureRegex = /0x([a-fA-F\d]{130})/
  const signature = '0x' + validationComment.cooked.match(signatureRegex)?.[1]
  const recoveredAddress = recoverAddress(hashMessage(formatValidationMessage(address, timestamp)), signature)

  return isSameAddress(recoveredAddress, address)
}
