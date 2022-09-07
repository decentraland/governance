import React from 'react'

import { UserStatBox } from './UserStatBox'
import './UserVpStats.css'

interface Props {
  address?: string
}

export default function UserVpStats({ address }: Props) {
  if (!address) {
    return null
  }

  return (
    <div className="UserVpStats__Container">
      <UserStatBox title={'titulito'} value={22000} info={'info text'} />
      <UserStatBox title={'titulito'} value={1234} info={'info text'} />
      <UserStatBox title={'titulito'} value={10} info={'info text'} />
    </div>
  )
}
