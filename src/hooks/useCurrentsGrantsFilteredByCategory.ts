import { useMemo } from 'react'

import filter from 'lodash/filter'

import { GrantWithUpdateAttributes, OldGrantCategory, PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

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
      [ProposalGrantCategory.Accelerator]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Accelerator
      ),
      [ProposalGrantCategory.CoreUnit]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.CoreUnit
      ),
      [ProposalGrantCategory.Documentation]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Documentation
      ),
      [ProposalGrantCategory.InWorldContent]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.InWorldContent
      ),
      [ProposalGrantCategory.Platform]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Platform
      ),
      [ProposalGrantCategory.SocialMediaContent]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.SocialMediaContent
      ),
      [ProposalGrantCategory.Sponsorship]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Sponsorship
      ),
    }),
    [grants]
  )
}
