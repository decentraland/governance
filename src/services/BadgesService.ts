import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { Badge, BadgeStatus, BadgeStatusReason, UserBadges, toBadgeStatus } from '../entities/Badges/types'
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
          category: ErrorCategory.BadgesError,
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
}
