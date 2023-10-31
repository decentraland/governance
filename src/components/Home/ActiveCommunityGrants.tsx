import { useMemo } from 'react'

import classNames from 'classnames'

import { ProposalType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProjects from '../../hooks/useProjects'
import locations from '../../utils/locations'
import FullWidthButton from '../Common/FullWidthButton'
import ProjectCard from '../Projects/ProjectCard/ProjectCard'

import './ActiveCommunityGrants.css'
import HomeLoader from './HomeLoader'
import HomeSectionHeader from './HomeSectionHeader'

const GRANTS_TO_SHOW = 4

const ActiveCommunityGrants = () => {
  const t = useFormatMessage()
  const { projects, isLoadingProjects } = useProjects()
  const grants = useMemo(() => projects?.data.filter((item) => item.type === ProposalType.Grant), [projects])

  return (
    <div className="ActiveCommunityGrants">
      <HomeSectionHeader
        title={t('page.home.active_community_grants.title')}
        description={t('page.home.active_community_grants.description')}
      />
      {isLoadingProjects && (
        <div className="ActiveCommunityGrants__LoaderContainer">
          <HomeLoader>{t('page.home.active_community_grants.fetching')}</HomeLoader>
        </div>
      )}
      {!isLoadingProjects && (
        <div className="ActiveCommunityGrants__Container">
          {grants &&
            grants.slice(0, GRANTS_TO_SHOW).map((project, index) => (
              <div
                className={classNames('HoverableCardContainer', index <= 1 && 'HoverableCardContainer__FirstRow')}
                key={`HoverableCard__${project.id}`}
              >
                <ProjectCard project={project} hoverable />
              </div>
            ))}
        </div>
      )}
      <FullWidthButton href={locations.projects()}>
        {t('page.home.active_community_grants.view_all_grants')}
      </FullWidthButton>
    </div>
  )
}

export default ActiveCommunityGrants
