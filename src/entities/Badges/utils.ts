import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'

import { ErrorClient } from '../../clients/ErrorClient'
import { OtterspaceSubgraph } from '../../clients/OtterspaceSubgraph'
import { TOP_VOTER_BADGE_IMG_URL } from '../../constants'
import Time from '../../utils/date/Time'
import { getPreviousMonthStartAndEnd } from '../../utils/date/getPreviousMonthStartAndEnd'
import { ErrorCategory } from '../../utils/errorCategories'
import { getUsersWhoVoted } from '../Snapshot/utils'

import { BadgeStatus } from './types'

const TOP_VOTER_TITLE_PREFIX = `Top Voter`

export async function getClassifiedUsersForBadge(badgeCid: string, users: string[]) {
  const badges = await OtterspaceSubgraph.get().getBadges(badgeCid)
  const listedUsers = new Set(users)

  const listedUsersWithoutBadge: Set<string> = new Set(users)
  const listedUsersWithRevokedBadge: Set<string> = new Set()
  const listedUsersWithBurnedBadge: Set<string> = new Set()
  const listedUsersWithMintedOrReinstatedBadge: Set<string> = new Set()
  const unlistedUsersWithRevokedOrBurnedBadge: Set<string> = new Set()
  const unlistedUsersWithMintedOrReinstatedBadge: Set<string> = new Set()

  for (const badge of badges) {
    const owner = badge.owner?.id.toLowerCase()
    if (owner) {
      if (listedUsers.has(owner)) {
        listedUsersWithoutBadge.delete(owner)
        if (badge.status === BadgeStatus.Revoked) {
          listedUsersWithRevokedBadge.add(owner)
        } else if (badge.status === BadgeStatus.Burned) {
          listedUsersWithBurnedBadge.add(owner)
        } else if (badge.status === BadgeStatus.Minted || badge.status === BadgeStatus.Reinstated) {
          listedUsersWithMintedOrReinstatedBadge.add(owner)
        }
      } else {
        if (badge.status === BadgeStatus.Revoked || badge.status === BadgeStatus.Burned) {
          unlistedUsersWithRevokedOrBurnedBadge.add(owner)
        } else if (badge.status === BadgeStatus.Minted || badge.status === BadgeStatus.Reinstated) {
          unlistedUsersWithMintedOrReinstatedBadge.add(owner)
        }
      }
    }
  }

  return {
    listedUsersWithoutBadge: Array.from(listedUsersWithoutBadge),
    listedUsersWithRevokedBadge: Array.from(listedUsersWithRevokedBadge),
    listedUsersWithBurnedBadge: Array.from(listedUsersWithBurnedBadge),
    listedUsersWithMintedOrReinstatedBadge: Array.from(listedUsersWithMintedOrReinstatedBadge),
    unlistedUsersWithRevokedOrBurnedBadge: Array.from(unlistedUsersWithRevokedOrBurnedBadge),
    unlistedUsersWithMintedOrReinstatedBadge: Array.from(unlistedUsersWithMintedOrReinstatedBadge),
  }
}

type ClassifiedUsersForBadgeAction = {
  eligibleUsersForBadge: string[]
  usersWithBadgesToReinstate: string[]
  usersWithBadgesToRevoke: string[]
  error?: string
}

export async function getEligibleUsersForBadge(
  badgeCid: string,
  addresses: string[]
): Promise<ClassifiedUsersForBadgeAction> {
  try {
    const { listedUsersWithoutBadge, listedUsersWithRevokedBadge, unlistedUsersWithMintedOrReinstatedBadge } =
      await getClassifiedUsersForBadge(badgeCid, addresses)

    const usersToCheck = [...listedUsersWithoutBadge, ...listedUsersWithRevokedBadge]
    const usersWhoVoted = usersToCheck.length > 0 ? await getUsersWhoVoted(usersToCheck) : new Set()

    const listedUsersWithoutBadgeWhoVoted = Array.from(listedUsersWithoutBadge).filter((user) =>
      usersWhoVoted.has(user)
    )
    const usersWithBadgesToReinstate = Array.from(listedUsersWithRevokedBadge).filter((user) => usersWhoVoted.has(user))

    return {
      eligibleUsersForBadge: listedUsersWithoutBadgeWhoVoted,
      usersWithBadgesToReinstate: usersWithBadgesToReinstate,
      usersWithBadgesToRevoke: unlistedUsersWithMintedOrReinstatedBadge,
    }
  } catch (error) {
    return {
      eligibleUsersForBadge: [],
      usersWithBadgesToReinstate: [],
      usersWithBadgesToRevoke: [],
      error: JSON.stringify(error),
    }
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
