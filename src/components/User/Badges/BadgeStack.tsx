import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
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
const MAX_STACKED_BADGES = 5

export default function BadgeStack({ badges, onClick, total }: Props) {
  const t = useFormatMessage()
  const badgesToShow = useMemo(() => badges.slice(0, MAX_STACKED_BADGES), [badges])

  return (
    <div className="BadgeStack__ShowMore" onClick={onClick}>
      {badgesToShow.map((badge, index) => {
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
        {t('page.profile.show_badges', { amount: total - MAX_DISPLAYED_BADGES })}
      </span>
    </div>
  )
}
