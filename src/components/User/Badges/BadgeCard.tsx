import React from 'react'

import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Badge } from '../../../entities/Badges/types'

import './BadgeCard.css'

const NO_IMAGE = require('../../../images/no-image.png').default

interface Props {
  badge: Badge
  onClick: () => void
}

export default function BadgeCard({ badge, onClick }: Props) {
  return (
    <div className="BadgeCard" key={`${badge.name}-id`} onClick={onClick}>
      <div className="BadgeCard__Icon">
        <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
        <div className="BadgeCard__Info">
          <div className="BadgeCard__Title">{badge.name}</div>
          <div className="BadgeCard__MintDate">{`Minted ${Time.unix(badge.createdAt).fromNow()}`}</div>
        </div>
      </div>
    </div>
  )
}
