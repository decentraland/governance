import { useMemo } from 'react'

import { Member } from '../../clients/Transparency'
import locations from '../../utils/locations'
import Avatar from '../Common/Avatar'
import Link from '../Common/Typography/Link'

import './MemberCard.css'

interface Props {
  member: Member
}

export default function MemberCard({ member }: Props) {
  const { name, address, avatar } = member
  const color = useMemo(() => (name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 16).toString(16), [name])

  return (
    <Link className="MemberCard" href={locations.profile({ address })}>
      <Avatar avatar={avatar} address={'0x' + color} />
      <div className="MemberCard__Description">{name}</div>
    </Link>
  )
}
