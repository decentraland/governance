import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'

import { ErrorClient } from '../../clients/ErrorClient'
import { OtterspaceSubgraph } from '../../clients/OtterspaceSubgraph'
import { TOP_VOTER_BADGE_IMG_URL } from '../../constants'
import Time from '../../utils/date/Time'
import { getPreviousMonthStartAndEnd } from '../../utils/date/getPreviousMonthStartAndEnd'
import { ErrorCategory } from '../../utils/errorCategories'
import { getUsersWhoVoted, isSameAddress } from '../Snapshot/utils'

import { BadgeStatus, BadgeStatusReason, ErrorReason } from './types'

const TOP_VOTER_TITLE_PREFIX = `Top Voter`

export async function getUsersWithoutBadge(badgeCid: string, users: string[]) {
  const badges = await OtterspaceSubgraph.get().getBadges(badgeCid)
  const usersWithBadgesToReinstate: string[] = []
  const usersWithoutBadge: string[] = []

  for (const user of users) {
    const userBadge = badges.find((badge) => isSameAddress(user, badge.owner?.id))
    if (!userBadge) {
      usersWithoutBadge.push(user)
      continue
    }
    if (userBadge.status === BadgeStatus.Revoked && userBadge.statusReason === BadgeStatusReason.TenureEnded) {
      usersWithBadgesToReinstate.push(user)
    }
  }

  return {
    usersWithoutBadge,
    usersWithBadgesToReinstate,
  }
}

type ValidatedUsers = {
  eligibleUsers: string[]
  usersWithBadgesToReinstate: string[]
  error?: string
}

export async function getValidatedUsersForBadge(badgeCid: string, addresses: string[]): Promise<ValidatedUsers> {
  try {
    const { usersWithoutBadge, usersWithBadgesToReinstate } = await getUsersWithoutBadge(badgeCid, addresses)
    const usersWhoVoted = usersWithoutBadge.length > 0 ? await getUsersWhoVoted(usersWithoutBadge) : []
    const result = {
      eligibleUsers: usersWhoVoted,
      usersWithBadgesToReinstate,
    }
    if (usersWithoutBadge.length === 0) {
      return { ...result, error: ErrorReason.NoUserWithoutBadge }
    }
    if (usersWhoVoted.length === 0) {
      return { ...result, error: ErrorReason.NoUserHasVoted }
    }
    return result
  } catch (error) {
    return { eligibleUsers: [], usersWithBadgesToReinstate: [], error: JSON.stringify(error) }
  }
}

export async function getLandOwnerAddresses(): Promise<string[]> {
  const LAND_API_URL = 'https://api.decentraland.org/v2/tiles?include=owner&type=owned'
  type LandOwner = { owner: string }
  try {
    const response: ApiResponse<{ [coordinates: string]: LandOwner }> = await (await fetch(LAND_API_URL)).json()
    const { data: landOwnersMap } = response
    const landOwnersAddresses = new Set(Object.values(landOwnersMap).map((landOwner) => landOwner.owner.toLowerCase()))
    return Array.from(landOwnersAddresses)
  } catch (error) {
    ErrorClient.report("Couldn't fetch land owners", { error, category: ErrorCategory.Badges })
    return []
  }
}

export function getTopVoterBadgeTitle(formattedMonth: string, formattedYear: string) {
  return `${TOP_VOTER_TITLE_PREFIX} - ${formattedMonth} ${formattedYear}`
}

export function getTopVoterBadgeDescription(formattedMonth: string, formattedYear: string) {
  return `This account belongs to an incredibly engaged Decentraland DAO user who secured one of the top 3 positions in the Voters ranking for ${formattedMonth} ${formattedYear}. By actively expressing their opinions through votes on DAO Proposals, they play a fundamental role in the development of the open metaverse.`
}

export function getTopVotersBadgeSpec() {
  const today = Time.utc()
  const { start } = getPreviousMonthStartAndEnd(today.toDate())
  const startTime = Time.utc(start)
  const formattedMonth = startTime.format('MMMM')
  const formattedYear = startTime.format('YYYY')
  return {
    title: getTopVoterBadgeTitle(formattedMonth, formattedYear),
    description: getTopVoterBadgeDescription(formattedMonth, formattedYear),
    imgUrl: TOP_VOTER_BADGE_IMG_URL,
    expiresAt: today.endOf('month').toISOString(),
  }
}

export async function isSpecAlreadyCreated(title: string): Promise<boolean> {
  const existingBadge = await OtterspaceSubgraph.get().getBadgeSpecByTitle(title)
  return !!existingBadge[0]
}

export function getIpfsHttpsLink(ipfsLink: string) {
  return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
}

export const getGithubBadgeImageUrl = (imageName: string) =>
  `https://github.com/Decentraland-DAO/badges/blob/ae5e518aabfc7adacad29733bc7bca118d56895c/images/${imageName}?raw=true`
