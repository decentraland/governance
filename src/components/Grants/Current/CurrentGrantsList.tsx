import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import { GrantStatus, NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from '../../../entities/Grant/types'
import { GrantWithUpdateAttributes, PROPOSAL_GRANT_CATEGORY_ALL } from '../../../entities/Proposal/types'
import { useCurrentGrantsFilteredByCategory } from '../../../hooks/useCurrentsGrantsFilteredByCategory'
import FullWidthButton from '../../Common/FullWidthButton'
import GrantCard from '../GrantCard/GrantCard'

import BudgetBanner from './BudgetBanner'
import { GrantCategoryFilter } from './CurrentGrantsCategoryFilters'
import './CurrentGrantsList.css'
import CurrentGrantsSortingMenu, { SortingKey } from './CurrentGrantsSortingMenu'

const CURRENT_GRANTS_PER_PAGE = 8

interface Props {
  grants: GrantWithUpdateAttributes[]
  category: ProposalGrantCategory | null
  status: GrantStatus | null
}

const CATEGORY_KEYS: Record<GrantCategoryFilter, string> = {
  [PROPOSAL_GRANT_CATEGORY_ALL]: 'page.grants.category_filters.all',
  [NewGrantCategory.Accelerator]: 'category.accelerator_title',
  [NewGrantCategory.CoreUnit]: 'category.core_unit_title',
  [NewGrantCategory.Documentation]: 'category.documentation_title',
  [NewGrantCategory.InWorldContent]: 'category.in_world_content_title',
  [NewGrantCategory.Platform]: 'category.platform_title',
  [NewGrantCategory.SocialMediaContent]: 'category.social_media_content_title',
  [NewGrantCategory.Sponsorship]: 'category.sponsorship_title',
  [OldGrantCategory.Community]: 'category.community_title',
  [OldGrantCategory.Gaming]: 'category.gaming_title',
  [OldGrantCategory.ContentCreator]: 'category.content_creator_title',
  [OldGrantCategory.PlatformContributor]: 'category.platform_contributor_title',
}

const GRANTS_STATUS_KEYS: Record<GrantStatus, string> = {
  [GrantStatus.InProgress]: 'grant_status.in_progress',
  [GrantStatus.Finished]: 'grant_status.finished',
  [GrantStatus.Paused]: 'grant_status.paused',
  [GrantStatus.Revoked]: 'grant_status.revoked',
}

const CurrentGrantsList = ({ grants, category, status }: Props) => {
  const t = useFormatMessage()
  const [selectedCategory, setSelectedCategory] = useState<GrantCategoryFilter>(PROPOSAL_GRANT_CATEGORY_ALL)
  const [sortingKey, setSortingKey] = useState<SortingKey>(SortingKey.UpdateTimestamp)
  const sortedCurrentGrants = useMemo(() => orderBy(grants, [sortingKey], ['desc']), [grants, sortingKey])
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantWithUpdateAttributes[]>([])
  const currentGrantsFilteredByCategory = useCurrentGrantsFilteredByCategory(sortedCurrentGrants)

  useEffect(() => {
    setSelectedCategory(category || PROPOSAL_GRANT_CATEGORY_ALL)
    if (!isEmpty(grants)) {
      setFilteredCurrentGrants(sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE))
    } else {
      setFilteredCurrentGrants([])
    }
  }, [category, grants, sortedCurrentGrants])

  useEffect(() => {
    if (!isEmpty(sortedCurrentGrants) && selectedCategory) {
      const newGrants =
        selectedCategory === PROPOSAL_GRANT_CATEGORY_ALL
          ? sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE)
          : filter(sortedCurrentGrants, (item) => item.configuration.category === selectedCategory).slice(
              0,
              CURRENT_GRANTS_PER_PAGE
            )
      setFilteredCurrentGrants(newGrants)
    }
  }, [sortedCurrentGrants, selectedCategory])

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (grants) {
      const newCurrentGrants = currentGrantsFilteredByCategory[selectedCategory].slice(
        0,
        filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE
      )
      setFilteredCurrentGrants(newCurrentGrants)
    }
  }, [grants, currentGrantsFilteredByCategory, selectedCategory, filteredCurrentGrants])

  const showLoadMoreCurrentGrantsButton =
    filteredCurrentGrants?.length !== currentGrantsFilteredByCategory[selectedCategory]?.length

  return (
    <>
      <div className="CurrentGrantsList">
        <div className="CurrentGrants__TitleContainer">
          <div>
            <h2 className="CurrentGrants__Title">
              {t('page.grants.grants_category_title', {
                status: status ? `${t(GRANTS_STATUS_KEYS[status])} ` : '',
                category: t(CATEGORY_KEYS[selectedCategory]),
              })}
            </h2>
          </div>
          <div className="CurrentGrants__Filters">
            <CurrentGrantsSortingMenu sortingKey={sortingKey} onSortingKeyChange={setSortingKey} />
          </div>
        </div>
        <BudgetBanner category={selectedCategory} />
        <Container className="CurrentGrants__Container">
          {filteredCurrentGrants?.map((grant) => (
            <GrantCard key={`CurrentGrantCard_${grant.id}`} grant={grant} />
          ))}
        </Container>
        {showLoadMoreCurrentGrantsButton && (
          <FullWidthButton onClick={handleLoadMoreCurrentGrantsClick}>
            {t('page.grants.load_more_button')}
          </FullWidthButton>
        )}
      </div>
    </>
  )
}

export default CurrentGrantsList
