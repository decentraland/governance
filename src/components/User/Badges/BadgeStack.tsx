import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { Badge } from '../../../entities/Badges/types'

import './BadgeStack.css'
import { MAX_DISPLAYED_BADGES } from './Badges'

interface Props {
  badges: Badge[]
  total: number
  onClick: () => void
}

const NO_IMAGE = require('../../../images/no-image.png').default

export default function BadgeStack({ badges, onClick, total }: Props) {
  return (
    <div className="BadgeStack__ShowMore" onClick={onClick}>
      {badges.map((badge, index) => {
        return (
          <div
            className={TokenList.join(['BadgeStack__Icon', index > 0 && 'BadgeStack__Overlapping'])}
            key={`${badge.name}-id`}
            style={{ zIndex: index, left: `${index * -16}px` }}
          >
            <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
          </div>
        )
      })}
      <span className="BadgeStack__Counter" style={{ left: `${(badges.length - 1) * -16}px` }}>
        {total - MAX_DISPLAYED_BADGES} MORE
      </span>
    </div>
  )
}
