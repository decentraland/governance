import { GovernanceBadgeSpec } from '../../entities/Badges/types'

import CoreUnitCard from './CoreUnitCard'
import './CoreUnitsSection.css'

interface Props {
  coreUnitsBadges: GovernanceBadgeSpec[]
}

function CoreUnitsSection({ coreUnitsBadges }: Props) {
  return (
    <div className="CoreUnitsSection">
      {coreUnitsBadges.map(({ name, badges }) => {
        return <CoreUnitCard key={name} name={name} badges={badges} />
      })}
    </div>
  )
}

export default CoreUnitsSection
