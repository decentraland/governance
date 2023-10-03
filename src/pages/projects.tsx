import { useMemo } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'
import toSnakeCase from 'lodash/snakeCase'

import WiderContainer from '../components/Common/WiderContainer'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import CurrentProjectsList from '../components/Projects/Current/CurrentProjectsList'
import ProjectsBanner from '../components/Projects/Current/ProjectsBanner'
import RequestBanner from '../components/Projects/RequestBanner'
import CategoryFilter, { ProjectTypeFilter } from '../components/Search/CategoryFilter'
import StatusFilter from '../components/Search/StatusFilter'
import {
  OldGrantCategory,
  ProjectStatus,
  SubtypeAlternativeOptions,
  SubtypeOptions,
  toGrantSubtype,
} from '../entities/Grant/types'
import { toProjectStatus } from '../entities/Grant/utils'
import { ProjectWithUpdate, ProposalType } from '../entities/Proposal/types'
import useFormatMessage from '../hooks/useFormatMessage'
import useProjects from '../hooks/useProjects'
import useURLSearchParams from '../hooks/useURLSearchParams'
import { isUnderMaintenance } from '../utils/maintenance'

import './projects.css'

function filterDisplayableProjects(
  projects: ProjectWithUpdate[] | undefined,
  type: string | undefined,
  subtype: SubtypeOptions | undefined,
  status: ProjectStatus | undefined
) {
  if (!projects) {
    return []
  }

  if (!type) {
    return projects.filter((item) => (status ? item.status === status : true))
  }

  if (type === ProjectTypeFilter.BiddingAndTendering) {
    return projects.filter((item) => item.type === ProposalType.Bid && (status ? item.status === status : true))
  }

  const grants = projects.filter((item) => item.type === ProposalType.Grant)
  if (type === ProjectTypeFilter.Grants && subtype === SubtypeAlternativeOptions.Legacy) {
    return grants.filter(
      (item) =>
        (status ? item.status === status : true) &&
        Object.values(OldGrantCategory).includes(item.configuration.category as OldGrantCategory)
    )
  }

  if (type === ProjectTypeFilter.Grants) {
    return grants.filter(
      (item) =>
        (status ? item.status === status : true) &&
        (subtype ? toSnakeCase(item.configuration.category) === toSnakeCase(subtype) : true)
    )
  }
}

function getCounter(projects: ProjectWithUpdate[] | undefined) {
  return {
    [ProjectTypeFilter.All]: projects?.length || 0,
    [ProjectTypeFilter.Grants]: projects?.filter((item) => item.type === ProposalType.Grant).length || 0,
    [ProjectTypeFilter.BiddingAndTendering]: projects?.filter((item) => item.type === ProposalType.Bid).length || 0,
  }
}

function toProjectTypeFilter(category?: string | null): ProjectTypeFilter | undefined {
  const categories = Object.values(ProjectTypeFilter)
  const index = categories.map(toSnakeCase).indexOf(toSnakeCase(category || undefined))

  return index !== -1 ? categories[index] : undefined
}

export default function ProjectsPage() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const type = toProjectTypeFilter(params.get('type'))
  const status = toProjectStatus(params.get('status'))
  const subtype = toGrantSubtype(params.get('subtype'))

  const { projects, isLoadingProjects } = useProjects()
  const displayableProjects = useMemo(
    () => filterDisplayableProjects(projects?.data, type, subtype, status),
    [projects?.data, type, subtype, status]
  )

  const counter = useMemo(() => getCounter(projects?.data), [projects?.data])

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout
        title={t('page.grants.title')}
        description={t('page.grants.description')}
        activeTab={NavigationTab.Grants}
      />
    )
  }

  return (
    <>
      <Head
        title={t('page.grants.title') || ''}
        description={t('page.grants.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Grants} />
      {isLoadingProjects && <LoadingView withNavigation />}
      {!isLoadingProjects && (
        <BurgerMenuLayout navigationOnly activeTab={NavigationTab.Grants}>
          <WiderContainer>
            <ProjectsBanner />
            <div className="ProjectsPage__Container">
              <div className="ProjectsPage__Sidebar">
                <NotMobile>
                  <CategoryFilter
                    filterType={ProjectTypeFilter}
                    categoryCount={counter}
                    startOpen
                    showAllFilter={false}
                  />
                  <StatusFilter statusType={ProjectStatus} startOpen />
                  <RequestBanner />
                </NotMobile>
              </div>
              <div>
                {displayableProjects && (
                  <CurrentProjectsList
                    projects={displayableProjects}
                    selectedType={type}
                    selectedSubtype={subtype}
                    status={toProjectStatus(status)}
                  />
                )}
              </div>
            </div>
          </WiderContainer>
        </BurgerMenuLayout>
      )}
    </>
  )
}
