import React, { useCallback } from 'react'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProjectHealth } from '../../entities/Updates/types'
import './ProjectHealthButton.css'

interface Props {
  children: React.ReactText
  type: ProjectHealth
  selectedValue: ProjectHealth
  onClick: (type: ProjectHealth) => void
  disabled: boolean
}

const ProjectHealthButton = ({ children, type, selectedValue, onClick, disabled }: Props) => {
  const isSelected = selectedValue === type

  return (
    <button
      onClick={() => onClick(type)}
      disabled={disabled}
      className={TokenList.join(['ProjectHealthButton', isSelected && `ProjectHealthButton--${type}`])}
    >
      {children}
    </button>
  )
}

export default ProjectHealthButton
