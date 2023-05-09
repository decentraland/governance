import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Badge as GovernanceBadge } from '../../../entities/Badges/types'

import Badge from './Badge'
import './BadgeCard.css'

interface Props {
  badge: GovernanceBadge
  onClick: () => void
}

export default function BadgeCard({ badge, onClick }: Props) {
  const t = useFormatMessage()

  return (
    <div className="BadgeCard" key={`${badge.name}-id`} onClick={onClick}>
      <Badge badge={badge} iconClassName="BadgeCard__Icon" />
      <div className="BadgeCard__Info">
        <div className="BadgeCard__Title">{badge.name}</div>
        <div className="BadgeCard__MintDate">
          {t('component.badge_card.mint_date', { at: Time.unix(badge.createdAt).fromNow() })}
        </div>
      </div>
    </div>
  )
}
