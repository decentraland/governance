import classNames from 'classnames'

import Divider from '../Common/Divider'
import Helper from '../Helper/Helper'

import './ProfileBox.css'

interface Props {
  title: string
  info?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ProfileBox({ children, title, info, action, className }: Props) {
  return (
    <div className={classNames('ProfileBox__Container', className)}>
      <div className={classNames('ProfileBox__Header', 'ProfileBox__Padded')}>
        <div className="ProfileBox__HeaderTitle">
          <span>{title}</span>
          {info && <Helper text={info} size="12" position="right center" />}
        </div>
        <div className="ProfileBox__HeaderAction">{action}</div>
      </div>
      <Divider className="ProfileBox__Divider" />
      <div className="ProfileBox__Padded">{children}</div>
    </div>
  )
}
