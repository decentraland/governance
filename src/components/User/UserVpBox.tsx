import React from 'react'

import VotingPower from '../Token/VotingPower'

import { UserStatBox } from './UserStatBox'
import './UserVpBox.css'

interface Props {
  title: string
  value?: number | bigint
  info?: string
  loading: boolean
}

export function UserVpBox({ title, info, value, loading }: Props) {
  return (
    <UserStatBox title={title} loading={loading} info={info}>
      <VotingPower value={value!} size="medium" className="UserVpBox__VotingPower" />
    </UserStatBox>
  )
}
