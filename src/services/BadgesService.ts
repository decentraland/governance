import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { Badge, BadgeStatus, BadgeStatusReason, UserBadges, toBadgeStatus } from '../entities/Badges/types'
import { airdrop } from '../entities/Badges/utils'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorService } from './ErrorService'

export class BadgesService {
  public static async getBadges(address: string): Promise<UserBadges> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  private static createBadgesList(otterspaceBadges: OtterspaceBadge[]): UserBadges {
    const currentBadges: Badge[] = []
    const expiredBadges: Badge[] = []
    for (const otterspaceBadge of otterspaceBadges) {
      try {
        const status = toBadgeStatus(otterspaceBadge.status)
        if (status !== BadgeStatus.Burned) {
          if (otterspaceBadge.spec.metadata) {
            const { name, description, image } = otterspaceBadge.spec.metadata
            const badge = {
              name,
              description,
              status,
              image: BadgesService.getIpfsHttpsLink(image),
              createdAt: otterspaceBadge.createdAt,
            }
            if (this.badgeExpired(status, otterspaceBadge.statusReason)) {
              expiredBadges.push(badge)
            } else {
              currentBadges.push(badge)
            }
          }
        }
      } catch (error) {
        ErrorService.report('Error parsing badge', {
          error,
          badge: otterspaceBadge,
          category: ErrorCategory.Badges,
        })
      }
    }

    return { currentBadges, expiredBadges, total: currentBadges.length + expiredBadges.length }
  }

  private static badgeExpired(status: BadgeStatus, statusReason: string) {
    return status === BadgeStatus.Revoked && statusReason === BadgeStatusReason.TenureEnded
  }

  private static getIpfsHttpsLink(ipfsLink: string) {
    return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }

  public static async grantBadgeToUsers(badgeCid: string, users: any[]): Promise<string> {
    const badgeOwners = await OtterspaceSubgraph.get().getBadgeOwners(badgeCid)

    const usersWithoutBadge = users.filter((user) => {
      return !badgeOwners.includes(user.toLowerCase())
    })

    if (usersWithoutBadge.length > 0) {
      return await this.airdropWithRetry(badgeCid, usersWithoutBadge)
    } else {
      return 'All recipients already have this badge'
    }
  }

  private static async airdropWithRetry(badgeCid: string, recipients: string[], retries = 3): Promise<string> {
    console.log('airdropping')
    try {
      await airdrop(badgeCid, recipients)
      return `Airdropped ${badgeCid} to ${recipients}`
    } catch (error) {
      console.error('Airdrop failed:', error)
      if (retries > 0) {
        console.log(`Retrying airdrop... Attempts left: ${retries}`)
        return await this.airdropWithRetry(badgeCid, recipients, retries - 1)
      } else {
        console.error('Airdrop failed after maximum retries.')
        return `Airdrop failed: ${error}`
        //TODO: handle failure accordingly
      }
    }
  }
}
