import { useIntl } from 'react-intl'

import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import { formatDate } from '../../utils/date/Time'

import FinancialCard from './FinancialCard'
import './FinancialCardsSection.css'

interface Props {
  releasedFundsValue: number
  latestTimestamp?: string
  txAmount: number
  disclosedFunds: number
  undisclosedFunds: number
}

function FinancialCardsSection({
  releasedFundsValue,
  latestTimestamp,
  txAmount,
  disclosedFunds,
  undisclosedFunds,
}: Props) {
  const t = useFormatMessage()
  const { formatNumber } = useIntl()
  return (
    <div className="FinancialCardsSection__CardsContainer">
      <FinancialCard
        type="income"
        title={t('page.proposal_update.funds_released_label')}
        value={formatNumber(releasedFundsValue, CURRENCY_FORMAT_OPTIONS)}
        subtitle={
          latestTimestamp
            ? t('page.proposal_update.funds_released_sublabel', {
                amount: txAmount,
                time: formatDate(new Date(latestTimestamp)),
              })
            : undefined
        }
      />
      <FinancialCard
        type="outcome"
        title={t('page.proposal_update.funds_disclosed_label')}
        value={formatNumber(disclosedFunds, CURRENCY_FORMAT_OPTIONS)}
        subtitle={t('page.proposal_update.funds_disclosed_sublabel', {
          funds: formatNumber(undisclosedFunds, CURRENCY_FORMAT_OPTIONS),
        })}
      />
    </div>
  )
}

export default FinancialCardsSection
