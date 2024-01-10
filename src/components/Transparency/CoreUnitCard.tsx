import { GovernanceBadgeSpec } from '../../entities/Badges/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Text from '../Common/Typography/Text'
import BadgeImage, { BadgeVariant } from '../User/Badges/Badge'

import './CoreUnitCard.css'

function CoreUnitCard({ name, badges }: GovernanceBadgeSpec) {
  const t = useFormatMessage()
  return (
    <div className="CoreUnitCard">
      <BadgeImage badge={badges[0]} size={45} variant={BadgeVariant.FilledDuo} />
      <div className="CoreUnitCard__TextContainer">
        <Text className="CoreUnitCard__Title" size="lg" weight="semi-bold">
          {name}
        </Text>
        <Text size="sm" color="secondary">
          {t('page.transparency.core_units.members', { amount: badges.length })}
        </Text>
      </div>
    </div>
  )
}

export default CoreUnitCard
