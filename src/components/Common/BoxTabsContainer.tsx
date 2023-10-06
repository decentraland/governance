import classNames from 'classnames'

import './BoxTabsContainer.css'

interface Props {
  className?: string
  children: React.ReactNode
}

const BoxTabsContainer = ({ className, children }: Props) => {
  return <div className={classNames('BoxTabsContainer', className)}>{children}</div>
}

export default BoxTabsContainer
