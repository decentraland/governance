import { useMemo } from 'react'

import filter from 'lodash/filter'

import { GrantWithUpdateAttributes, OldGrantCategory, PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

export function useCurrentGrantsFilteredByCategory(grants: GrantWithUpdateAttributes[]) {
  // TODO: Add new category filters
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
    }),
    [grants]
  )
}
