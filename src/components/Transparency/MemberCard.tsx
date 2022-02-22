import React from 'react'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'

import './MemberCard.css'

export type MemberCardProps = React.HTMLAttributes<HTMLDivElement> & {
  member: {
    avatar: string,
    name: string
  }
}

export default function MemberCard({ member }: MemberCardProps) {
  let color = (member.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 16).toString(16);
  return (
    <div className="MemberCard">
      <Avatar src={member.avatar} size="medium" address={'0x' + color}/>
      <div className="MemberCard_description">
        <span>{member.name}</span>
      </div>
    </div>
  )
}
