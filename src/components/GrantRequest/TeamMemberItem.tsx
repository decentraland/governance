import React from 'react'

import { TeamMember } from '../../entities/Grant/types'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './TeamMemberItem.css'

interface Props {
  item: TeamMember
  onClick: () => void
}

const TeamMemberItem = ({ item, onClick }: Props) => {
  const { name, role } = item

  return (
    <div role="button" className="TeamMemberItem" onClick={onClick}>
      <div>
        <h3 className="TeamMemberItem__Concept">{name}</h3>
        <span className="TeamMemberItem__Duration">{role}</span>
      </div>
      <ChevronRightCircleOutline />
    </div>
  )
}

export default TeamMemberItem
