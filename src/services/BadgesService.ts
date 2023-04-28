import { BadgeStatus, OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { Badge, UserBadges, toBadgeStatus } from '../entities/Badges/types'

import { ErrorService } from './ErrorService'

export class BadgesService {
  public static async getBadges(address: string): Promise<UserBadges> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  //TODO: badge grouping
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
              image: BadgesService.getHttpsLink(image),
              createdAt: otterspaceBadge.createdAt,
            }
            if (status === BadgeStatus.REVOKED) {
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

  private static getHttpsLink(ipfsLink: string) {
    return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
}
