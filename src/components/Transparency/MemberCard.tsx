import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Address } from 'decentraland-ui/dist/components/Address/Address'

import './MemberCard.css'

export type MemberCardProps = React.HTMLAttributes<HTMLDivElement> & {
  member: {
    address: string,
    name: string
  }
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="MemberCard">
      <Avatar address={member.address} size="medium" />
      <div className="MemberCard_description">
        <div className="MemberCard_header">
          <Header sub><Address value={member.address}/></Header>
        </div>
        <span>{member.name}</span>
      </div>
    </div>
  )
}
