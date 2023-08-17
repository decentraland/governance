import { useMemo } from 'react'

import filter from 'lodash/filter'

import { ProjectTypeFilter } from '../components/Search/CategoryFilter'
import { NewGrantCategory, OldGrantCategory } from '../entities/Grant/types'
import { GrantWithUpdate, ProposalType } from '../entities/Proposal/types'

export function useCurrentGrantsFilteredByCategory(projects: GrantWithUpdate[]) {
  return useMemo(
    () => ({
      all_projects: projects,
      legacy: filter(
        projects,
        (item) =>
          item.type === ProposalType.Grant &&
          Object.values(OldGrantCategory).includes(item.configuration.category as OldGrantCategory)
      ),
      [ProjectTypeFilter.Grants]: filter(projects, (item) => item.type === ProposalType.Grant),
      [ProjectTypeFilter.BiddingAndTendering]: filter(projects, (item) => item.type === ProposalType.Bid),
      [NewGrantCategory.Accelerator]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.Accelerator
      ),
      [NewGrantCategory.CoreUnit]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.CoreUnit
      ),
      [NewGrantCategory.Documentation]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.Documentation
      ),
      [NewGrantCategory.InWorldContent]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.InWorldContent
      ),
      [NewGrantCategory.Platform]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.Platform
      ),
      [NewGrantCategory.SocialMediaContent]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.SocialMediaContent
      ),
      [NewGrantCategory.Sponsorship]: filter(
        projects,
        (item) => item.configuration.category === NewGrantCategory.Sponsorship
      ),
    }),
    [projects]
  )
}
