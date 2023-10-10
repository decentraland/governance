import { useIntl } from 'react-intl'

import { ProjectWithUpdate } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Username from '../../Common/Username'
import ProjectPill from '../ProjectPill'

import './ProjectCardHeader.css'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  project: ProjectWithUpdate
}

const ProjectCardHeader = ({ project }: Props) => {
  const { configuration, size, user } = project
  const intl = useIntl()
  const t = useFormatMessage()

  return (
    <div className="ProjectCardHeader">
      <div className="ProjectCardHeader__ConfigurationInfo">
        {configuration.category && <ProjectPill type={configuration.category} />}
        <div className="ProjectCardHeader__SizeContainer">
          <p className="ProjectCardHeader__Size">{`${t('component.grant_card.size')}: $${intl.formatNumber(
            size
          )} USD`}</p>
        </div>
      </div>
      <div className="ProjectCardHeader__Username">
        {t('component.grant_card.by_user')}
        <Username address={user} variant="address" />
      </div>
    </div>
  )
}

export default ProjectCardHeader
