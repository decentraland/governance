import React from 'react'

import { Badge as GovernanceBadge } from '../../../entities/Badges/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import Markdown from '../../Common/Markdown/Markdown'

import Badge, { BadgeVariant } from './Badge'
import './BadgeDetail.css'

interface Props {
  badge: GovernanceBadge
}

function addNewLinesAfterFirstDot(text: string): string {
  const dotIndex = text.indexOf('.')
  if (dotIndex === -1) return text

  const firstPart = text.substring(0, dotIndex + 1)
  const secondPart = text.substring(dotIndex + 1)
  return `${firstPart}\n\n${secondPart}`
}

export default function BadgeDetail({ badge }: Props) {
  const t = useFormatMessage()

  return (
    <div className="BadgeDetail__Container">
      <Badge badge={badge} variant={BadgeVariant.Primary} iconClassName="BadgeDetail__Icon" />
      <div className="BadgeDetail__Info">
        <div className="BadgeDetail__Title">{badge.name}</div>
        <div className="BadgeDetail__MintDate">
          {t('component.badge_card.mint_date', { at: Time.unix(badge.createdAt).fromNow() })}
        </div>
      </div>
      <Markdown className="BadgeDetail__Description">{addNewLinesAfterFirstDot(badge.description)}</Markdown>
    </div>
  )
}
