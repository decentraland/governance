import { useCallback, useEffect, useMemo, useState } from 'react'

import { navigate } from '@reach/router'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import {
  NewGrantCategory,
  ProjectStatus,
  SubtypeAlternativeOptions,
  SubtypeOptions,
} from '../../../entities/Grant/types'
import { ProjectWithUpdate } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useYearAndQuarter from '../../../hooks/useYearAndQuarter'
import locations from '../../../utils/locations'
import Empty, { ActionType } from '../../Common/Empty'
import FullWidthButton from '../../Common/FullWidthButton'
import Watermelon from '../../Icon/Watermelon'
import { ProjectTypeFilter } from '../../Search/CategoryFilter'
import ProjectCard from '../ProjectCard/ProjectCard'

import BudgetBanner from './BudgetBanner'
import './CurrentProjectsList.css'
import CurrentProjectsSortingMenu, { SortingKey } from './CurrentProjectsSortingMenu'
import StatsAllProjects from './StatsAllProjects'
import StatsBiddingAndTendering from './StatsBiddingAndTendering'

const CURRENT_GRANTS_PER_PAGE = 8

interface Props {
  projects: ProjectWithUpdate[]
  selectedType?: ProjectTypeFilter
  selectedSubtype?: SubtypeOptions
  status?: ProjectStatus
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [sortingKey, setSortingKey] = useState<SortingKey>(SortingKey.UpdateTimestamp)
  const sortedCurrentGrants = useMemo(() => orderBy(projects, [sortingKey], ['desc']), [projects, sortingKey])
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<ProjectWithUpdate[]>([])
  const { year, quarter } = useYearAndQuarter()

  useEffect(() => {
    if (!isEmpty(projects)) {
      setFilteredCurrentGrants(sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE))
    } else {
      setFilteredCurrentGrants([])
    }
  }, [selectedSubtype, selectedType, projects, sortedCurrentGrants])

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (sortedCurrentGrants) {
      const newProjects = sortedCurrentGrants.slice(0, filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE)
      setFilteredCurrentGrants(newProjects)
    }
  }, [sortedCurrentGrants, filteredCurrentGrants])

  const showLoadMoreCurrentGrantsButton = filteredCurrentGrants?.length !== projects?.length

  return (
    <div className="CurrentProjectsList">
      <div className="CurrentProjectsList__TitleContainer">
        <div>
          <h2 className="CurrentProjectsList__Title">
            {t('page.grants.projects_category_title', {
              quarter,
              year,
              status: status ? `${t(GRANTS_STATUS_KEYS[status])} ` : '',
              category: t(getCategoryKey(selectedSubtype || selectedType)),
            })}
          </h2>
        </div>
        <div className="CurrentProjectsList__Filters">
          <CurrentProjectsSortingMenu sortingKey={sortingKey} onSortingKeyChange={setSortingKey} />
        </div>
      </div>
      {selectedType !== ProjectTypeFilter.Grants && selectedType !== ProjectTypeFilter.BiddingAndTendering && (
        <StatsAllProjects projects={projects} />
      )}
      {selectedType === ProjectTypeFilter.BiddingAndTendering && <StatsBiddingAndTendering projects={projects} />}
      {selectedType === ProjectTypeFilter.Grants && (
        <BudgetBanner
          category={selectedSubtype || SubtypeAlternativeOptions.All}
          initiativesCount={projects.length}
          status={status}
        />
      )}
      {isEmpty(projects) && (
        <Empty
          className="CurrentProjectsList__Empty"
          icon={<Watermelon />}
          description={t('page.grants.empty.description')}
          onLinkClick={() => navigate(locations.projects())}
          linkText={t('page.grants.empty.button')}
          actionType={ActionType.BUTTON}
        />
      )}
      {filteredCurrentGrants && filteredCurrentGrants.length > 0 && (
        <div className="CurrentProjectsList__Container">
          {filteredCurrentGrants.map((project) => (
            <ProjectCard key={`CurrentProjectCard_${project.id}`} project={project} />
          ))}
        </div>
      )}
      {showLoadMoreCurrentGrantsButton && (
        <FullWidthButton onClick={handleLoadMoreCurrentGrantsClick}>
          {t('page.grants.load_more_button')}
        </FullWidthButton>
      )}
    </div>
  )
}
