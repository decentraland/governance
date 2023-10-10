import classNames from 'classnames'

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
      onClick={(e) => {
        e.preventDefault()
        onClick(type)
      }}
      disabled={disabled}
      className={classNames('ProjectHealthButton', isSelected && `ProjectHealthButton--${type}`)}
    >
      {children}
    </button>
  )
}

export default ProjectHealthButton
