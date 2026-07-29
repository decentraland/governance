import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { hashMessage, recoverAddress } from 'ethers/lib/utils'
import capitalize from 'lodash/capitalize'
import escapeRegExp from 'lodash/escapeRegExp'

import { FORUM_URL } from '../../constants'
import { DiscoursePostInTopic } from '../../shared/types/discourse'
import { ProposalComment, ProposalCommentsInDiscourse } from '../Proposal/types'
import { isSameAddress } from '../Snapshot/utils'

import { MESSAGE_TIMEOUT_TIME } from './constants'
import { AccountType, ValidatedForumAccount, ValidationComment } from './types'

export const DISCOURSE_USER = process.env.GATSBY_DISCOURSE_USER || 'dao'
export const DISCOURSE_API = process.env.GATSBY_DISCOURSE_API || ''
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
  validatedAccounts?: ValidatedForumAccount[]
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

export function formatValidationMessage(address: string, timestamp: string, account?: AccountType) {
  return `By signing and posting this message I'm linking my Decentraland DAO account ${address} with this ${
    account ? `${capitalize(account)} ` : ''
  }account\n\nDate: ${timestamp}`
}

export function getValidationComment(comments: ValidationComment[], address: string, timestamp: string) {
  const timeWindow = new Date(new Date().getTime() - MESSAGE_TIMEOUT_TIME)
  // escapeRegExp so the address/timestamp are matched literally (defense-in-depth against a
  // regex-injection/ReDoS if the source of these values ever changes to accept free-form input).
  const addressRegex = new RegExp(escapeRegExp(address), 'i')
  const dateRegex = new RegExp(escapeRegExp(timestamp), 'i')

  const matchingComments = comments.filter((comment) => {
    return (
      new Date(comment.timestamp) > timeWindow && addressRegex.test(comment.content) && dateRegex.test(comment.content)
    )
  })

  // Fail closed on ambiguity. The address, timestamp, and signature are all public the moment the
  // user posts their verification comment, so anyone can copy them into a second comment from a
  // different forum/Discord account. If more than one comment matches we cannot tell which account
  // is the genuine owner, so we refuse to link rather than risk binding the wallet to an impersonator.
  if (matchingComments.length > 1) {
    throw new Error('Multiple matching verification comments found; aborting to avoid linking the wrong account')
  }

  return matchingComments[0]
}

export function validateComment(
  validationComment: ValidationComment,
  address: string,
  timestamp: string,
  account?: AccountType
) {
  const signatureRegex = /0x([a-fA-F\d]{130})/
  const signature = '0x' + validationComment.content.match(signatureRegex)?.[1]
  const recoveredAddress = recoverAddress(hashMessage(formatValidationMessage(address, timestamp, account)), signature)

  return isSameAddress(recoveredAddress, address)
}

// Takes unknown rather than string: the value comes from a request body or query string, so it can
// be a number, an object or anything else json admits. Calling toLowerCase on those raises a
// TypeError, which would surface as a 500 for what is a malformed request.
export function toAccountType(account: unknown): AccountType | undefined {
  if (typeof account !== 'string') return undefined
  return Object.values(AccountType).find((a) => a.toLowerCase() === account.toLowerCase())
}

export function parseAccountTypes(accounts?: unknown): AccountType[] {
  if (!accounts) return []

  const accountsArray = Array.isArray(accounts) ? accounts : [accounts]
  return accountsArray.map((account) => toAccountType(account)).filter((account) => !!account) as AccountType[]
}

// Both callers take this straight from a request, so a bad value is the caller's mistake rather
// than the server's. A plain Error would surface as a 500.
export function validateAccountTypes(accounts?: unknown): AccountType[] {
  const parsedAccounts = parseAccountTypes(accounts)
  if (parsedAccounts.length === 0) {
    throw new RequestError(`Invalid account types. Received: ${accounts}`, RequestError.BadRequest)
  }
  return parsedAccounts
}
