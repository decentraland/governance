import { useMemo } from 'react'

import filter from 'lodash/filter'

import { NewGrantCategory, OldGrantCategory } from '../entities/Grant/types'
import { GrantWithUpdateAttributes, PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

export function useCurrentGrantsFilteredByCategory(grants: GrantWithUpdateAttributes[]) {
  // TODO: Check this
  return useMemo(
    () => ({
      [PROPOSAL_GRANT_CATEGORY_ALL]: grants,
      [OldGrantCategory.Community]: filter(
        grants,
        (item) => item.configuration.category === OldGrantCategory.Community
      ),
      [OldGrantCategory.Gaming]: filter(grants, (item) => item.configuration.category === OldGrantCategory.Gaming),
      [OldGrantCategory.PlatformContributor]: filter(
        grants,
        (item) => item.configuration.category === OldGrantCategory.PlatformContributor
      ),
      [OldGrantCategory.ContentCreator]: filter(
        grants,
        (item) => item.configuration.category === OldGrantCategory.ContentCreator
      ),
      [NewGrantCategory.Accelerator]: filter(
        grants,
        (item) => item.configuration.category === NewGrantCategory.Accelerator
      ),
      [NewGrantCategory.CoreUnit]: filter(grants, (item) => item.configuration.category === NewGrantCategory.CoreUnit),
      [NewGrantCategory.Documentation]: filter(
        grants,
        (item) => item.configuration.category === NewGrantCategory.Documentation
      ),
      [NewGrantCategory.InWorldContent]: filter(
        grants,
        (item) => item.configuration.category === NewGrantCategory.InWorldContent
      ),
      [NewGrantCategory.Platform]: filter(grants, (item) => item.configuration.category === NewGrantCategory.Platform),
      [NewGrantCategory.SocialMediaContent]: filter(
        grants,
        (item) => item.configuration.category === NewGrantCategory.SocialMediaContent
      ),
      [NewGrantCategory.Sponsorship]: filter(
        grants,
        (item) => item.configuration.category === NewGrantCategory.Sponsorship
      ),
    }),
    [grants]
  )
}
