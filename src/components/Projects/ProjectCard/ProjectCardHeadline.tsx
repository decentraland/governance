import classNames from 'classnames'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProjectWithUpdate } from '../../../entities/Proposal/types'
import Username from '../../Common/Username'

import './ProjectCardHeadline.css'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  project: ProjectWithUpdate
  hoverable?: boolean
  expanded?: boolean
}

const ProjectCardHeadline = ({ project, hoverable = false, expanded = false }: Props) => {
  const { title, user } = project

  return (
    <div className={classNames('ProjectCardHeadline', !expanded && 'ProjectCardHeadline__Slim')}>
      <Header
        className={classNames(
          'ProjectCardHeadline__Title',
          (!hoverable || !expanded) && 'ProjectCardHeadline__TwoLineEllipsis'
        )}
      >
        {title}
      </Header>
      <Username className="ProjectCardHeadline__Avatar" address={user} variant="avatar" size="m" />
    </div>
  )
}

export default ProjectCardHeadline
