import useCoreUnitsBadges from '../../hooks/useCoreUnitsBadges'

import CoreUnitCard from './CoreUnitCard'
import './CoreUnitsSection.css'

function CoreUnitsSection() {
  const { coreUnitsBadges } = useCoreUnitsBadges()
  return (
    <div className="CoreUnitsSection">
      {coreUnitsBadges &&
        Object.entries(coreUnitsBadges).map(([title, badges]) => {
          return <CoreUnitCard key={title} badges={badges} />
        })}
    </div>
  )
}

export default CoreUnitsSection
