import { useIntl } from 'react-intl'

import { SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useBudgetByCategory from '../../hooks/useBudgetByCategory'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import { ProjectTypeFilter } from '../Search/CategoryFilter'
import FinancialCard from '../Updates/FinancialCard'

import DaoFinancial from './DaoFinancial'

function BudgetCard() {
  const t = useFormatMessage()
  const { allocatedPercentage: percentage, allocated, total } = useBudgetByCategory(SubtypeAlternativeOptions.All)
  const quarter = Time().quarter()
  const { formatNumber } = useIntl()

  return (
    <DaoFinancial>
      <FinancialCard
        title={t('page.transparency.mission.budget_title', { quarter })}
        value={formatNumber(total, CURRENCY_FORMAT_OPTIONS)}
        subtitle={t('page.transparency.mission.budget_subtitle', {
          consumed: formatNumber(allocated, CURRENCY_FORMAT_OPTIONS),
          percentage,
        })}
        href={locations.projects(ProjectTypeFilter.Grants)}
        helper={t('page.transparency.mission.budget_helper')}
      />
    </DaoFinancial>
  )
}

export default BudgetCard
