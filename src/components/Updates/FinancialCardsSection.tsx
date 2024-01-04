import { useIntl } from 'react-intl'

import { VestingLog } from '../../clients/VestingData'
import { UpdateAttributes } from '../../entities/Updates/types'
import { getFundsReleasedSinceLastUpdate } from '../../entities/Updates/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import { formatDate } from '../../utils/date/Time'

import FinancialCard from './FinancialCard'
import './FinancialCardsSection.css'

interface Props {
  releases?: VestingLog[]
  lastUpdate?: Omit<UpdateAttributes, 'id' | 'proposal_id'>
  disclosedFunds: number
}

function FinancialCardsSection({ releases, lastUpdate, disclosedFunds }: Props) {
  const t = useFormatMessage()
  const { value: releasedFundsValue, txAmount } = getFundsReleasedSinceLastUpdate(lastUpdate, releases)
  const lastRelease = releases?.[0]
  const undisclosedFunds = disclosedFunds <= releasedFundsValue ? releasedFundsValue - disclosedFunds : 0
  const { formatNumber } = useIntl()
  return (
    <div className="FinancialCardsSection__CardsContainer">
      <FinancialCard
        type="income"
        title={t('page.proposal_update.funds_released_label')}
        value={releasedFundsValue}
        subtitle={
          lastRelease
            ? t('page.proposal_update.funds_released_sublabel', {
                amount: txAmount,
                time: formatDate(new Date(lastRelease.timestamp)),
              })
            : undefined
        }
      />
      <FinancialCard
        type="outcome"
        title={t('page.proposal_update.funds_disclosed_label')}
        value={disclosedFunds}
        subtitle={t('page.proposal_update.funds_disclosed_sublabel', {
          funds: formatNumber(undisclosedFunds, CURRENCY_FORMAT_OPTIONS),
        })}
      />
    </div>
  )
}

export default FinancialCardsSection
