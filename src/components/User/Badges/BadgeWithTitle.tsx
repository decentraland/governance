import { Badge as GovernanceBadge } from '../../../entities/Badges/types'

import Badge, { BadgeVariant } from './Badge'
import './BadgeWithTitle.css'

interface Props {
  badge: GovernanceBadge
  onClick: () => void
}

export default function BadgeWithTitle({ badge, onClick }: Props) {
  return (
    <div className="BadgeWithTitle" key={`${badge.name}-id`} onClick={onClick}>
      <Badge badge={badge} variant={BadgeVariant.FilledMono} />
      <div className="BadgeWithTitle__Title">
        <span>{badge.name}</span>
      </div>
    </div>
  )
}
