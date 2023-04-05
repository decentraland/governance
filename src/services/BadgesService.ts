import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { Badge } from '../entities/Badges/types'

export class BadgesService {
  public static async getBadges(address: string): Promise<Badge[]> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  private static createBadgesList(otterspaceBadges: OtterspaceBadge[]): Badge[] {
    const badges: Badge[] = []

    for (const badge of otterspaceBadges) {
      const { name, description, image } = badge.spec.metadata
      const existingBadge = badges.find((badge) => badge.name === name && badge.description === description)

      if (existingBadge) {
        existingBadge.amount++
      } else {
        //TODO: should we send unclaimed badges to the front, and display them somehow?
        badges.push({
          name,
          description,
          image: BadgesService.getHttpsLink(image),
          amount: 1,
        })
      }
    }

    return badges
  }

  private static getHttpsLink(ipfsLink: string) {
    return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
}
