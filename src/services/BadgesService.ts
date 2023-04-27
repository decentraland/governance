import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { Badge, toBadgeStatus } from '../entities/Badges/types'

import { ErrorService } from './ErrorService'

export class BadgesService {
  public static async getBadges(address: string): Promise<Badge[]> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  //TODO: badge grouping
  private static createBadgesList(otterspaceBadges: OtterspaceBadge[]): Badge[] {
    const badges: Badge[] = []
    for (const badge of otterspaceBadges) {
      try {
        if (badge.spec.metadata) {
          const { name, description, image } = badge.spec.metadata
          badges.push({
            name,
            description,
            image: BadgesService.getHttpsLink(image),
            status: toBadgeStatus(badge.status, () => {
              throw new Error(`Invalid badge status ${badge.status}`)
            }),
          })
        }
      } catch (e) {
        console.log(`Error parsing badge ${badge}`, e)
        ErrorService.report(`Error parsing badge ${badge}`, e)
      }
    }

    return badges
  }

  private static getHttpsLink(ipfsLink: string) {
    return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
}
