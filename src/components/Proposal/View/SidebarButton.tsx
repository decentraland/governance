import classNames from 'classnames'

import './DetailsSection.css'
import './SectionButton.css'

interface Props {
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}

function SidebarButton({ loading, disabled, onClick, className, children }: Props) {
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
      <div className={classNames('SectionButton__Container', className)}>{children}</div>
    </button>
  )
}

export default SidebarButton
