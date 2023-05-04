import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Badge as GovernanceBadge } from '../../../entities/Badges/types'

import Badge, { BadgeVariant } from './Badge'
import './BadgeDetail.css'

interface Props {
  badge: GovernanceBadge
}

export default function BadgeDetail({ badge }: Props) {
  const t = useFormatMessage()
  return (
    <div className="BadgeDetail__Container">
      <Badge badge={badge} variant={BadgeVariant.Primary} className="BadgeDetail__Icon" />
      <div className="BadgeDetail__Info">
        <div className="BadgeDetail__Title">{badge.name}</div>
        <div className="BadgeDetail__MintDate">
          {t('component.badge_card.mint_date', { at: Time.unix(badge.createdAt).fromNow() })}
        </div>
      </div>
      <Markdown className="BadgeDetail__Description">{badge.description}</Markdown>
    </div>
  )
}
