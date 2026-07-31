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

// account is required: it is part of the string that gets signed, so omitting it here silently
// makes every signature fail to verify instead of failing where the mistake was made.
export function formatValidationMessage(address: string, timestamp: string, account: AccountType) {
  return `By signing and posting this message I'm linking my Decentraland DAO account ${address} with this ${capitalize(
    account
  )} account\n\nDate: ${timestamp}`
}

// Named so the caller can tell deliberate interference apart from a generic validation failure.
export class AmbiguousValidationError extends Error {
  constructor() {
    super('Multiple matching verification comments found; aborting to avoid linking the wrong account')
    this.name = 'AmbiguousValidationError'
  }
}

export class ValidationTimeoutError extends Error {
  constructor() {
    super('Validation timed out')
    this.name = 'ValidationTimeoutError'
  }
}

export function getValidationComment(
  comments: ValidationComment[],
  address: string,
  timestamp: string,
  account: AccountType
) {
  const timeWindow = new Date(new Date().getTime() - MESSAGE_TIMEOUT_TIME)
  // escapeRegExp so the address/timestamp are matched literally (defense-in-depth against a
  // regex-injection/ReDoS if the source of these values ever changes to accept free-form input).
  const addressRegex = new RegExp(escapeRegExp(address), 'i')
  const dateRegex = new RegExp(escapeRegExp(timestamp), 'i')

  // The signature is checked here rather than by the caller so that a comment carrying the address
  // and timestamp without a valid signature is simply not a candidate: anyone can copy those two
  // public values, and letting them count would let a stranger interfere with someone else's link.
  const matchingComments = comments.filter(
    (comment) =>
      // An unattributable comment cannot be linked to anything, and must not be able to pair with
      // another one and read as two accounts.
      !!comment.userId &&
      new Date(comment.timestamp) > timeWindow &&
      addressRegex.test(comment.content) &&
      dateRegex.test(comment.content) &&
      validateComment(comment, address, timestamp, account)
  )

  // Refuse rather than choose. The signature is public once posted, so another account can carry a
  // valid copy of it, and no timestamp identifies the original: discord keeps createdTimestamp on
  // the snowflake when a message is edited, and discourse moves updated_at for reasons other than
  // an edit. Anything that ranks these candidates can be steered, so nothing ranks them.
  //
  // Counted per account, not per comment: two posts from one account resolve to the same link, so
  // someone who posts their own verification message twice is unambiguous and should still link.
  if (new Set(matchingComments.map((comment) => comment.userId)).size > 1) {
    throw new AmbiguousValidationError()
  }

  return matchingComments[0]
}

export function validateComment(
  validationComment: ValidationComment,
  address: string,
  timestamp: string,
  account: AccountType
) {
  const signatureRegex = /0x([a-fA-F\d]{130})/
  const signature = validationComment.content.match(signatureRegex)?.[1]
  if (!signature) {
    return false
  }

  try {
    const recoveredAddress = recoverAddress(
      hashMessage(formatValidationMessage(address, timestamp, account)),
      `0x${signature}`
    )
    return isSameAddress(recoveredAddress, address)
  } catch {
    // A malformed signature is a rejected candidate, not a server error.
    return false
  }
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

// Strict counterpart to parseAccountTypes, which drops what it does not recognise. Both callers take
// this straight from a request, so anything unrecognised is the caller's mistake rather than the
// server's — and answering about a subset of what was asked for is worse than refusing, because the
// caller cannot tell it happened. A plain Error would also surface as a 500.
export function validateAccountTypes(accounts?: unknown): AccountType[] {
  const supplied = accounts === undefined || accounts === null ? [] : Array.isArray(accounts) ? accounts : [accounts]
  const parsedAccounts = parseAccountTypes(accounts)
  if (parsedAccounts.length === 0 || parsedAccounts.length !== supplied.length) {
    throw new RequestError(`Invalid account types. Received: ${accounts}`, RequestError.BadRequest)
  }
  return parsedAccounts
}
