import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Badge } from '../../../entities/Badges/types'

import './BadgeDetail.css'

const NO_IMAGE = require('../../../images/no-image.png').default

interface Props {
  badge: Badge
}

export default function BadgeDetail({ badge }: Props) {
  const t = useFormatMessage()
  return (
    <div className="BadgeDetail__Container">
      <div className="BadgeDetail__Icon">
        <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
      </div>
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
