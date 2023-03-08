import React from 'react'

import { TeamMember } from '../../entities/Grant/types'
import CloseCircle from '../Icon/CloseCircle'

import './TeamMemberItem.css'

interface Props {
  item: TeamMember
  onDeleteClick: () => void
}

const TeamMemberItem = ({ item, onDeleteClick }: Props) => {
  const { name, role } = item

  return (
    <div className="TeamMemberItem">
      <div>
        <h3 className="TeamMemberItem__Concept">{name}</h3>
        <span className="TeamMemberItem__Duration">{role}</span>
      </div>
      <button className="TeamMemberItem__DeleteButton" onClick={onDeleteClick}>
        <CloseCircle />
      </button>
    </div>
  )
}

export default TeamMemberItem
