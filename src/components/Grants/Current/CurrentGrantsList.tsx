import React, { useCallback, useEffect, useState } from 'react'

import { navigate } from '@reach/router'
import isEmpty from 'lodash/isEmpty'

import { NewGrantCategory, OldGrantCategory, ProjectStatus, SubtypeOptions } from '../../../entities/Grant/types'
import { GrantWithUpdate } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations from '../../../utils/locations'
import Empty, { ActionType } from '../../Common/Empty'
import FullWidthButton from '../../Common/FullWidthButton'
import Watermelon from '../../Icon/Watermelon'
import { Counter, ProjectCategoryFilter } from '../../Search/CategoryFilter'
import GrantCard from '../GrantCard/GrantCard'

import BudgetBanner from './BudgetBanner'
import './CurrentGrantsList.css'
import CurrentGrantsSortingMenu, { SortingKey } from './CurrentGrantsSortingMenu'

const CURRENT_GRANTS_PER_PAGE = 8

interface Props {
  grants: GrantWithUpdate[]
  selectedType: any // TODO: Type this correctly
  selectedSubtype?: SubtypeOptions
  status?: ProjectStatus
  counter?: Counter
}

const CATEGORY_KEYS: Record<any, string> = {
  [ProjectCategoryFilter.BiddingAndTendering]: 'page.grants.category_filters.bidding_and_tendering',
  [ProjectCategoryFilter.Grants]: 'page.grants.category_filters.all',
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

const GRANTS_STATUS_KEYS: Record<ProjectStatus, string> = {
  [ProjectStatus.Pending]: 'grant_status.pending',
  [ProjectStatus.InProgress]: 'grant_status.in_progress',
  [ProjectStatus.Finished]: 'grant_status.finished',
  [ProjectStatus.Paused]: 'grant_status.paused',
  [ProjectStatus.Revoked]: 'grant_status.revoked',
}

const CurrentGrantsList = ({ grants, selectedSubtype, selectedType, status, counter }: Props) => {
  const t = useFormatMessage()
  const [sortingKey, setSortingKey] = useState<SortingKey>(SortingKey.UpdateTimestamp) // TODO: Move sorting key to query param
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantWithUpdate[]>([])

  useEffect(() => {
    if (!isEmpty(grants)) {
      setFilteredCurrentGrants(grants.slice(0, CURRENT_GRANTS_PER_PAGE))
    } else {
      setFilteredCurrentGrants([])
    }
  }, [grants])

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (grants) {
      const newCurrentGrants = grants.slice(0, filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE)
      setFilteredCurrentGrants(newCurrentGrants)
    }
  }, [grants, filteredCurrentGrants])

  const showLoadMoreCurrentGrantsButton = filteredCurrentGrants?.length !== grants?.length

  return (
    <>
      <div className="CurrentGrantsList">
        <div className="CurrentGrants__TitleContainer">
          <div>
            <h2 className="CurrentGrants__Title">
              {t('page.grants.projects_category_title', {
                status: status ? `${t(GRANTS_STATUS_KEYS[status])} ` : '',
                category: t(CATEGORY_KEYS[selectedSubtype || selectedType] || 'page.grants.category_filters.all'),
              })}
            </h2>
          </div>
          <div className="CurrentGrants__Filters">
            <CurrentGrantsSortingMenu sortingKey={sortingKey} onSortingKeyChange={setSortingKey} />
          </div>
        </div>
        {selectedType === ProjectCategoryFilter.Grants && (
          <BudgetBanner category={selectedSubtype} counter={counter} status={status} />
        )}
        {isEmpty(grants) && (
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
    </>
  )
}

export default CurrentGrantsList
