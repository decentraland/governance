import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import Divider from '../Common/Divider'
import Helper from '../Helper/Helper'

import './ProfileBox.css'

interface Props {
  title: string
  info?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function ProfileBox({ children, title, info, action }: Props) {
  return (
    <div className="ProfileBox__Container">
      <div className={TokenList.join(['ProfileBox__Header', 'ProfileBox__Padded'])}>
        <div className="ProfileBox__Header--title">
          <span>{title}</span>
          {info && <Helper text={info} size="12" position="right center" />}
        </div>
        <div>{action}</div>
      </div>
      <Divider className="ProfileBox__Divider" color="var(--black-300)" />
      <div className="ProfileBox__Padded">{children}</div>
    </div>
  )
}
