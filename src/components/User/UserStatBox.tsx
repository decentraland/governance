import React from 'react'

import Helper from '../Helper/Helper'
import VotingPower from '../Token/VotingPower'

import './UserStatBox.css'

interface Props {
  title: string
  value: number | bigint
  info: string
}

export function UserStatBox({ title, info, value }: Props) {
  return (
    <div className="UserStatBox__Container">
      <div className="UserStatBox__Header">
        <span className="UserStatBox__Title">{title}</span>
        <Helper text={info} position="bottom center" size="14" containerClassName="UserStatBox__Info" />
      </div>
      <VotingPower value={value} size="medium" className="UserStatBox__Value" />
    </div>
  )
}
