import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import Helper from '../Helper/Helper'
import Divider from '../Section/Divider'

import './ProfileBox.css'

interface Props {
  title: string
  info?: string
  children: React.ReactNode
}

export function ProfileBox({ children, title, info }: Props) {
  return (
    <div className="ProfileBox__Container">
      <div className={TokenList.join(['ProfileBox__Header', 'ProfileBox__Padded'])}>
        <span>{title}</span>
        {info && <Helper text={info} size="12" position="right center" />}
      </div>
      <Divider className="ProfileBox__Divider" color="var(--black-300)" />
      <div className="ProfileBox__Padded">{children}</div>
    </div>
  )
}
