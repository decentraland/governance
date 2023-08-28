import React from 'react'

import classNames from 'classnames'

import './DetailsSection.css'
import './SectionButton.css'

interface Props {
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

function SidebarButton({ loading, disabled, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'DetailsSection',
        'SectionButton',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled'
      )}
    >
      <div className="SectionButton__Container">{children}</div>
    </button>
  )
}

export default SidebarButton
