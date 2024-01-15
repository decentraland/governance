import { useIntl } from 'react-intl'

import { DAO_VESTING_CONTRACT_ADDRESS } from '../../constants'
import { SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { CURRENCY_FORMAT_OPTIONS, getVestingContractUrl } from '../../helpers'
import useBudgetByCategory from '../../hooks/useBudgetByCategory'
import useFormatMessage from '../../hooks/useFormatMessage'
import useVestingContractData from '../../hooks/useVestingContractData'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import { ProjectTypeFilter } from '../Search/CategoryFilter'
import FinancialCard from '../Updates/FinancialCard'

import './CardsSection.css'

function CardsSection() {
  const t = useFormatMessage()
  const { vestingData } = useVestingContractData([DAO_VESTING_CONTRACT_ADDRESS])
  const { released, releasable } = vestingData?.[0] || {}
  const { allocatedPercentage: percentage, allocated } = useBudgetByCategory(SubtypeAlternativeOptions.All)
  const currentQuarter = Time().quarter()
  const currentYear = Time().year()
  const { formatNumber } = useIntl()
  return (
    <div className="CardsSection">
      <FinancialCard
        title={t('page.transparency.mission.vesting_title')}
        value={t('page.transparency.mission.vesting_value', {
          value: released && releasable ? formatNumber(released + releasable) : '--',
        })}
        subtitle={t('page.transparency.mission.vesting_subtitle', {
          value: releasable ? formatNumber(releasable) : '--',
        })}
        href={getVestingContractUrl(DAO_VESTING_CONTRACT_ADDRESS)}
      />
      <FinancialCard
        title={t('page.transparency.mission.budget_title')}
        value={t('page.transparency.mission.budget_value', {
          value: formatNumber(allocated, CURRENCY_FORMAT_OPTIONS),
          quarter: currentQuarter,
          year: currentYear % 100,
        })}
        subtitle={t('page.transparency.mission.budget_subtitle', { percentage })}
        href={locations.projects(ProjectTypeFilter.Grants)}
      />
    </div>
  )
}

export default CardsSection
