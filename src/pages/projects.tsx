import React, { useMemo } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'
import toSnakeCase from 'lodash/snakeCase'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import WiderContainer from '../components/Common/WiderContainer'
import CurrentGrantsBanner from '../components/Grants/Current/CurrentGrantsBanner'
import CurrentGrantsList from '../components/Grants/Current/CurrentGrantsList'
import RequestBanner from '../components/Grants/RequestBanner'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import CategoryFilter, { ProjectCategoryFilter } from '../components/Search/CategoryFilter'
import StatusFilter from '../components/Search/StatusFilter'
import {
  NewGrantCategory,
  OldGrantCategory,
  ProjectStatus,
  SubtypeAlternativeOptions,
  SubtypeOptions,
  toGrantSubtype,
} from '../entities/Grant/types'
import { toProjectStatus } from '../entities/Grant/utils'
import { GrantWithUpdate, ProposalType } from '../entities/Proposal/types'
import useFormatMessage from '../hooks/useFormatMessage'
import useProjects from '../hooks/useProjects'
import useURLSearchParams from '../hooks/useURLSearchParams'
import { isUnderMaintenance } from '../utils/maintenance'

function filterDisplayableProjects(
  projects: GrantWithUpdate[] | undefined,
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

  if (type === ProjectCategoryFilter.BiddingAndTendering) {
    return projects.filter((item) => item.type === ProposalType.Bid && (status ? item.status === status : true))
  }

  const grants = projects.filter((item) => item.type === ProposalType.Grant)
  if (type === ProjectCategoryFilter.Grants && subtype === SubtypeAlternativeOptions.Legacy) {
    return grants.filter(
      (item) =>
        (status ? item.status === status : true) &&
        Object.values(OldGrantCategory).includes(item.configuration.category as OldGrantCategory)
    )
  }

  if (type === ProjectCategoryFilter.Grants) {
    return grants.filter(
      (item) =>
        (status ? item.status === status : true) &&
        (subtype ? toSnakeCase(item.configuration.category) === toSnakeCase(subtype) : true)
    )
  }
}

function getCounter(projects: GrantWithUpdate[] | undefined) {
  return {
    all_projects: projects?.length || 0,
    grants: projects?.filter((item) => item.type === ProposalType.Grant).length || 0,
    bidding_and_tendering: projects?.filter((item) => item.type === ProposalType.Bid).length || 0,
    accelerator:
      projects?.filter(
        (item) => item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.Accelerator
      ).length || 0,
    core_unit:
      projects?.filter(
        (item) => item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.CoreUnit
      ).length || 0,
    documentation:
      projects?.filter(
        (item) => item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.Documentation
      ).length || 0,
    in_world_content:
      projects?.filter(
        (item) => item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.InWorldContent
      ).length || 0,
    platform:
      projects?.filter(
        (item) => item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.Platform
      ).length || 0,
    social_media_content:
      projects?.filter(
        (item) =>
          item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.SocialMediaContent
      ).length || 0,
    sponsorship:
      projects?.filter(
        (item) => item.type === ProposalType.Grant && item.configuration.category === NewGrantCategory.Sponsorship
      ).length || 0,
    legacy:
      projects?.filter(
        (item) =>
          item.type === ProposalType.Grant &&
          Object.values(OldGrantCategory).includes(item.configuration.category as OldGrantCategory)
      ).length || 0,
  }
}

export default function ProjectsPage() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const type = (params.get('type') || undefined) as ProjectCategoryFilter | undefined // TODO: toProjectCategoryFilter
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
            <CurrentGrantsBanner />
            <Grid stackable>
              <Grid.Row>
                <Grid.Column tablet="3">
                  <NotMobile>
                    <CategoryFilter filterType={ProjectCategoryFilter} categoryCount={counter} startOpen />
                    <StatusFilter statusType={ProjectStatus} startOpen />
                    <RequestBanner />
                  </NotMobile>
                </Grid.Column>
                <Grid.Column tablet="13">
                  {displayableProjects && (
                    <CurrentGrantsList
                      projects={displayableProjects}
                      selectedType={type}
                      selectedSubtype={subtype}
                      status={toProjectStatus(status)}
                      counter={counter}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </WiderContainer>
        </BurgerMenuLayout>
      )}
    </>
  )
}
