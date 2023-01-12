import { useMemo } from 'react'

import filter from 'lodash/filter'

import {
  GrantWithUpdateAttributes,
  PROPOSAL_GRANT_CATEGORY_ALL,
  ProposalGrantCategory,
} from '../entities/Proposal/types'

export function useCurrentGrantsFilteredByCategory(grants: GrantWithUpdateAttributes[]) {
  // TODO: Add new category filters
  return useMemo(
    () => ({
      [PROPOSAL_GRANT_CATEGORY_ALL]: grants,
      [ProposalGrantCategory.Community]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Community
      ),
      [ProposalGrantCategory.Gaming]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Gaming
      ),
      [ProposalGrantCategory.PlatformContributor]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.PlatformContributor
      ),
      [ProposalGrantCategory.ContentCreator]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.ContentCreator
      ),
    }),
    [grants]
  )
}
