import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import Helper from '../Helper/Helper'
import VotingPower from '../Token/VotingPower'

import './UserStatBox.css'

interface Props {
  title: string
  children?: React.ReactNode
  info?: string
  loading: boolean
  className?: string
}

export function UserStatBox({ title, info, children, loading, className }: Props) {
  return (
    <div className={TokenList.join(['UserStatBox__Container', className])}>
      <div className="UserStatBox__Header">
        {loading ? <Skeleton className="UserStatBox__Title" /> : <span className="UserStatBox__Title">{title}</span>}
        {!loading && info && (
          <Helper text={info} position="bottom center" size="14" containerClassName="UserStatBox__Info" />
        )}
      </div>
      {loading ? <Skeleton className="UserStatBox__Value" /> : children}
    </div>
  )
}
