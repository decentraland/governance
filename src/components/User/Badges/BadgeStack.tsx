import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { Badge as GovernanceBadge } from '../../../entities/Badges/types'

import Badge, { BadgeVariant } from './Badge'
import './BadgeStack.css'
import { MAX_DISPLAYED_BADGES } from './Badges'

interface Props {
  badges: GovernanceBadge[]
  total: number
  onClick: () => void
}

const MAX_STACKED_BADGES = 3

function counterMargin(stackedBadges: number) {
  return `${(stackedBadges - 1) * 16}px`
}

export default function BadgeStack({ badges, onClick, total }: Props) {
  const t = useFormatMessage()
  const badgesToShow = useMemo(() => badges.slice(0, MAX_STACKED_BADGES), [badges])

  return (
    <div className="BadgeStack" onClick={onClick}>
      {badgesToShow.map((badge, index) => {
        return (
          <div
            className={TokenList.join(['BadgeStack__Icon', index > 0 && 'BadgeStack__Overlapping'])}
            key={`${badge.name}-id`}
            style={{ zIndex: index, right: `${index * 16}px` }}
          >
            <Badge badge={badge} variant={BadgeVariant.FilledMonoSmall} className="BadgeStack__Badge" />
          </div>
        )
      })}
      <span className="BadgeStack__Counter" style={{ right: counterMargin(badgesToShow.length) }}>
        {t('page.profile.show_badges', { amount: total })}
      </span>
    </div>
  )
}
