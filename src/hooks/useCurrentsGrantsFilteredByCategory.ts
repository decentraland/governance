import { useMemo } from 'react'

import filter from 'lodash/filter'

import {
  GrantWithUpdateAttributes,
  PROPOSAL_GRANT_CATEGORY_ALL,
  ProposalGrantCategory,
} from '../entities/Proposal/types'

export function useCurrentGrantsFilteredByCategory(grants: GrantWithUpdateAttributes[]) {
  // TODO: Check this
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
