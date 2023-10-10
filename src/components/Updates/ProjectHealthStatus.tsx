import classNames from 'classnames'
import toSnakeCase from 'lodash/snakeCase'

import { ProjectHealth } from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Cancel from '../Icon/Cancel'
import CheckCircle from '../Icon/CheckCircle'
import Warning from '../Icon/Warning'

import './ProjectHealthStatus.css'

const getIconComponent = (health: ProjectHealth) => {
  if (health === ProjectHealth.AtRisk) {
    return Warning
  }

  if (health === ProjectHealth.OffTrack) {
    return Cancel
  }

  return CheckCircle
}

interface Props {
  health: ProjectHealth
}

const ProjectHealthStatus = ({ health }: Props) => {
  const t = useFormatMessage()
  const titleText = t(`page.update_detail.${toSnakeCase(health)}_title`)
  const descriptionText = t(`page.update_detail.${toSnakeCase(health)}_description`)
  const Icon = getIconComponent(health)

  return (
    <div className={classNames('ProjectHealthStatus', `ProjectHealthStatus--${health}`)}>
      <Icon className="ProjectHealthStatus__Icon" />
      <div>
        <span className={classNames('ProjectHealthStatus__Title', `ProjectHealthStatus__Title--${health}`)}>
          {titleText}
        </span>
        <p className="ProjectHealthStatus__Description">{descriptionText}</p>
      </div>
    </div>
  )
}

export default ProjectHealthStatus
