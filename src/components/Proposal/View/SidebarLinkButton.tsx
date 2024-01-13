import classNames from 'classnames'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import Link from '../../Common/Typography/Link'
import Open from '../../Icon/Open'

import './DetailsSection.css'
import './SectionButton.css'

export interface SidebarLinkButtonProps {
  loading?: boolean
  disabled?: boolean
  href: string
  children: string
  isExternal?: boolean
  icon?: React.ReactNode
}

function SidebarLinkButton({ loading, disabled, href, isExternal = true, children, icon }: SidebarLinkButtonProps) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <Link
      href={href}
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
    </Link>
  )
}

export default SidebarLinkButton
