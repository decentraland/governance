import { Badge as GovernanceBadge } from '../../../entities/Badges/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'

import Badge from './Badge'
import './BadgeCard.css'

interface Props {
  badge: GovernanceBadge
  onClick: (badge: GovernanceBadge) => void
}

export default function BadgeCard({ badge, onClick }: Props) {
  const t = useFormatMessage()
  const handleClick = () => onClick(badge)

  return (
    <div className="BadgeCard" key={`${badge.name}-id`} onClick={handleClick}>
      <Badge badge={badge} size={120} iconClassName="BadgeCard__Icon" />
      <div className="BadgeCard__Info">
        <div className="BadgeCard__Title">{badge.name}</div>
        <div className="BadgeCard__MintDate">
          {t('component.badge_card.mint_date', { at: Time.unix(badge.createdAt).fromNow() })}
        </div>
      </div>
    </div>
  )
}
