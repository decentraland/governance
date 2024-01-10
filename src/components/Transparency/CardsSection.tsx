import { useIntl } from 'react-intl'

import { DAO_VESTING_CONTRACT_ADDRESS } from '../../constants'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useBudgetByCategory from '../../hooks/useBudgetByCategory'
import useFormatMessage from '../../hooks/useFormatMessage'
import useVestingContractData from '../../hooks/useVestingContractData'
import Time from '../../utils/date/Time'
import FinancialCard from '../Updates/FinancialCard'

import './CardsSection.css'

function CardsSection() {
  const t = useFormatMessage()
  const { vestingData } = useVestingContractData([DAO_VESTING_CONTRACT_ADDRESS])
  const { released, releasable } = vestingData?.[0] || {}
  const { allocatedPercentage: percentage, allocated } = useBudgetByCategory('all_grants')
  const currentQuarter = Time().quarter()
  const currentYear = Time().year()
  const { formatNumber } = useIntl()
  return (
    <div className="CardsSection">
      <FinancialCard
        title={t('page.transparency.mission.vesting_title')}
        value={t('page.transparency.mission.vesting_value', {
          value: formatNumber((released ?? 0) + (releasable ?? 0)),
        })}
        subtitle={t('page.transparency.mission.vesting_subtitle', { value: formatNumber(releasable ?? 0) })}
      />
      <FinancialCard
        title={t('page.transparency.mission.budget_title')}
        value={t('page.transparency.mission.budget_value', {
          value: formatNumber(allocated, CURRENCY_FORMAT_OPTIONS),
          quarter: currentQuarter,
          year: currentYear % 100,
        })}
        subtitle={t('page.transparency.mission.budget_subtitle', { percentage })}
      />
    </div>
  )
}

export default CardsSection
