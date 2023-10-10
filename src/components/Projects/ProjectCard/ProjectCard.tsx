import { useState } from 'react'

import classNames from 'classnames'

import { ProjectWithUpdate } from '../../../entities/Proposal/types'
import { isProposalInCliffPeriod } from '../../../entities/Proposal/utils'
import locations from '../../../utils/locations'
import Link from '../../Common/Typography/Link'
import ProposalUpdate from '../../Proposal/Update/ProposalUpdate'

import CliffProgress from './CliffProgress'
import './ProjectCard.css'
import ProjectCardHeader from './ProjectCardHeader'
import ProjectCardHeadline from './ProjectCardHeadline'
import VestingProgress from './VestingProgress'

interface Props {
  project: ProjectWithUpdate
  hoverable?: boolean
}

const ProjectCard = ({ project, hoverable = false }: Props) => {
  const { id, enacted_at, update } = project
  const [expanded, setExpanded] = useState(!hoverable)
  const proposalInCliffPeriod = !!enacted_at && isProposalInCliffPeriod(enacted_at)

  return (
    <Link
      href={locations.proposal(id)}
      onMouseEnter={() => hoverable && setExpanded(true)}
      onMouseLeave={() => hoverable && setExpanded(false)}
      className={classNames('ProjectCard', hoverable && 'ProjectCard__Expanded')}
    >
      <div>
        <ProjectCardHeader project={project} />
        <ProjectCardHeadline project={project} expanded={expanded} hoverable={hoverable} />
        {proposalInCliffPeriod ? <CliffProgress enactedAt={enacted_at} /> : <VestingProgress project={project} />}
      </div>
      <div className="ProjectCard__UpdateContainer">
        <ProposalUpdate proposal={project} update={update} expanded={false} index={update?.index} isLinkable={false} />
      </div>
    </Link>
  )
}

export default ProjectCard
