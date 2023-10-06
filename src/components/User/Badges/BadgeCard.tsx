import { Badge as GovernanceBadge } from '../../../entities/Badges/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'

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
