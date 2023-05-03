import { BadgeStatus, BadgeStatusReason, OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { Badge, UserBadges, toBadgeStatus } from '../entities/Badges/types'

import { ErrorService } from './ErrorService'

export class BadgesService {
  public static async getBadges(address: string): Promise<UserBadges> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  private static createBadgesList(otterspaceBadges: OtterspaceBadge[]): UserBadges {
    const currentBadges: Badge[] = []
    const expiredBadges: Badge[] = []
    let total = 0
    for (const otterspaceBadge of otterspaceBadges) {
      try {
        const status = toBadgeStatus(otterspaceBadge.status, () => {
          throw new Error(`Invalid badge status ${otterspaceBadge.status}`)
        })
        if (status !== BadgeStatus.BURNED) {
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
            total++
          }
        }
      } catch (e) {
        console.log(`Error parsing badge ${otterspaceBadge}`, e)
        ErrorService.report(`Error parsing badge ${otterspaceBadge}`, e)
      }
    }

    return { currentBadges, expiredBadges, total }
  }

  private static badgeExpired(status: BadgeStatus, statusReason: string) {
    return status === BadgeStatus.REVOKED && statusReason === BadgeStatusReason.TENURE_ENDED
  }

  private static getIpfsHttpsLink(ipfsLink: string) {
    return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
}
