import classNames from 'classnames'

import './SidebarHeaderLabel.css'

interface Props {
  children: React.ReactText
  className?: string
}

export default function SidebarHeaderLabel({ className, children }: Props) {
  return <div className={classNames('SidebarHeaderLabel', className)}>{children}</div>
}
