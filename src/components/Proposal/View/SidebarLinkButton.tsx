import classNames from 'classnames'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import Open from '../../Icon/Open'

import './DetailsSection.css'
import './SectionButton.css'

interface Props {
  loading?: boolean
  disabled?: boolean
  href: string
  children: string
  isExternal?: boolean
  icon?: React.ReactNode
}

function SidebarLinkButton({ loading, disabled, href, isExternal = true, children, icon }: Props) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={classNames(
        'DetailsSection',
        'SectionButton',
        'SidebarLinkButton',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled'
      )}
    >
      <div className="SectionButton__Container">
        <Loader active={loading} size="small" />
        {icon}
        <span>{children}</span>
      </div>
      {isExternal && <Open />}
    </a>
  )
}

export default SidebarLinkButton
