import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import Helper from '../Helper/Helper'
import VotingPower from '../Token/VotingPower'

import './UserStatBox.css'

interface Props {
  title: string
  value: number | bigint
  info: string
  loading: boolean
}

export function UserStatBox({ title, info, value, loading }: Props) {
  return (
    <div className="UserStatBox__Container">
      <div className="UserStatBox__Header">
        {loading ? <Skeleton className="UserStatBox__Title" /> : <span className="UserStatBox__Title">{title}</span>}
        {!loading && <Helper text={info} position="bottom center" size="14" containerClassName="UserStatBox__Info" />}
      </div>
      {loading ? (
        <Skeleton className="UserStatBox__Value" />
      ) : (
        <VotingPower value={value} size="medium" className="UserStatBox__Value" />
      )}
    </div>
  )
}
