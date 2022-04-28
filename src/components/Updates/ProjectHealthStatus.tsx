import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import toSnakeCase from 'lodash/snakeCase'
import { ProjectHealth } from '../../entities/Updates/types'
import './ProjectHealthStatus.css'
import Check from '../Icon/Check'
import Warning from '../Icon/Warning'
import Cancel from '../Icon/Cancel'

const getIconComponent = (health: ProjectHealth) => {
  if (health === ProjectHealth.AtRisk) {
    return Warning
  }

  if (health === ProjectHealth.OffTrack) {
    return Cancel
  }

  return Check
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
    <div className={TokenList.join(['ProjectHealthStatus', `ProjectHealthStatus--${health}`])}>
      <Icon className="ProjectHealthStatus__Icon" />
      <div>
        <span className={TokenList.join(['ProjectHealthStatus__Title', `ProjectHealthStatus__Title--${health}`])}>
          {titleText}
        </span>
        <p className="ProjectHealthStatus__Description">{descriptionText}</p>
      </div>
    </div>
  )
}

export default ProjectHealthStatus
