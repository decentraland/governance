import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { navigate } from '@reach/router'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import {
  NewGrantCategory,
  ProjectStatus,
  SubtypeAlternativeOptions,
  SubtypeOptions,
} from '../../../entities/Grant/types'
import { GrantWithUpdate } from '../../../entities/Proposal/types'
import { useCurrentGrantsFilteredByCategory } from '../../../hooks/useCurrentGrantsFilteredByCategory'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations from '../../../utils/locations'
import Empty, { ActionType } from '../../Common/Empty'
import FullWidthButton from '../../Common/FullWidthButton'
import Watermelon from '../../Icon/Watermelon'
import { ProjectTypeFilter } from '../../Search/CategoryFilter'
import GrantCard from '../GrantCard/GrantCard'

import BudgetBanner from './BudgetBanner'
import './CurrentGrantsList.css'
import CurrentGrantsSortingMenu, { SortingKey } from './CurrentGrantsSortingMenu'

const CURRENT_GRANTS_PER_PAGE = 8

interface Props {
  projects: GrantWithUpdate[]
  selectedType?: ProjectTypeFilter
  selectedSubtype?: SubtypeOptions
  status?: ProjectStatus
}

const CATEGORY_KEYS: Record<any, string> = {
  [ProjectTypeFilter.BiddingAndTendering]: 'page.grants.category_filters.bidding_and_tendering',
  [ProjectTypeFilter.Grants]: 'page.grants.category_filters.grants',
  [NewGrantCategory.Accelerator]: 'category.accelerator_title',
  [NewGrantCategory.CoreUnit]: 'category.core_unit_title',
  [NewGrantCategory.Documentation]: 'category.documentation_title',
  [NewGrantCategory.InWorldContent]: 'category.in_world_content_title',
  [NewGrantCategory.Platform]: 'category.platform_title',
  [NewGrantCategory.SocialMediaContent]: 'category.social_media_content_title',
  [NewGrantCategory.Sponsorship]: 'category.sponsorship_title',
  [SubtypeAlternativeOptions.Legacy]: 'category.legacy_title',
}

function getCategoryKey(type?: string) {
  if (!type) {
    return 'page.grants.category_filters.all'
  }

  return CATEGORY_KEYS[type]
}

const GRANTS_STATUS_KEYS: Record<ProjectStatus, string> = {
  [ProjectStatus.Pending]: 'grant_status.pending',
  [ProjectStatus.InProgress]: 'grant_status.in_progress',
  [ProjectStatus.Finished]: 'grant_status.finished',
  [ProjectStatus.Paused]: 'grant_status.paused',
  [ProjectStatus.Revoked]: 'grant_status.revoked',
}

export default function CurrentProjectsList({ projects, selectedSubtype, selectedType, status }: Props) {
  const t = useFormatMessage()
  const [selectedCategory, setSelectedCategory] = useState('all_projects')
  const [sortingKey, setSortingKey] = useState<SortingKey>(SortingKey.UpdateTimestamp)
  const sortedCurrentGrants = useMemo(() => orderBy(projects, [sortingKey], ['desc']), [projects, sortingKey])
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantWithUpdate[]>([])
  // TODO: Fix typing of currentGrantsFilteredByCategory indexing
  const currentGrantsFilteredByCategory = useCurrentGrantsFilteredByCategory(sortedCurrentGrants)

  useEffect(() => {
    setSelectedCategory(selectedSubtype || selectedType || 'all_projects')
    if (!isEmpty(projects)) {
      setFilteredCurrentGrants(sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE))
    } else {
      setFilteredCurrentGrants([])
    }
  }, [selectedSubtype, selectedType, projects, sortedCurrentGrants])

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (projects) {
      const newCurrentGrants = (currentGrantsFilteredByCategory as any)[selectedCategory].slice(
        0,
        filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE
      )
      setFilteredCurrentGrants(newCurrentGrants)
    }
  }, [projects, currentGrantsFilteredByCategory, selectedCategory, filteredCurrentGrants])

  const showLoadMoreCurrentGrantsButton =
    filteredCurrentGrants?.length !== (currentGrantsFilteredByCategory as any)[selectedCategory]?.length

  return (
    <div className="CurrentGrantsList">
      <div className="CurrentGrants__TitleContainer">
        <div>
          {
            <h2 className="CurrentGrants__Title">
              {t('page.grants.projects_category_title', {
                status: status ? `${t(GRANTS_STATUS_KEYS[status])} ` : '',
                category: t(getCategoryKey(selectedSubtype || selectedType)),
              })}
            </h2>
          }
        </div>
        <div className="CurrentGrants__Filters">
          <CurrentGrantsSortingMenu sortingKey={sortingKey} onSortingKeyChange={setSortingKey} />
        </div>
      </div>
      {selectedType === ProjectTypeFilter.Grants && (
        <BudgetBanner
          category={selectedSubtype || SubtypeAlternativeOptions.All}
          initiativesCount={projects.length}
          status={status}
        />
      )}
      {isEmpty(projects) && (
        <Empty
          className="CurrentGrants__Empty"
          icon={<Watermelon />}
          description={t('page.grants.empty.description')}
          onLinkClick={() => navigate(locations.projects())}
          linkText={t('page.grants.empty.button')}
          actionType={ActionType.BUTTON}
        />
      )}
      <div className="CurrentGrants__Container">
        {filteredCurrentGrants?.map((grant) => (
          <GrantCard key={`CurrentGrantCard_${grant.id}`} grant={grant} />
        ))}
      </div>
      {showLoadMoreCurrentGrantsButton && (
        <FullWidthButton onClick={handleLoadMoreCurrentGrantsClick}>
          {t('page.grants.load_more_button')}
        </FullWidthButton>
      )}
    </div>
  )
}
