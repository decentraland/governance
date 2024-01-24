import { useIntl } from 'react-intl'

import { VestingLog } from '../../clients/VestingData'
import { UpdateAttributes } from '../../entities/Updates/types'
import { getFundsReleasedSinceLatestUpdate } from '../../entities/Updates/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import { formatDate } from '../../utils/date/Time'

import FinancialCard from './FinancialCard'
import './FinancialCardsSection.css'

interface Props {
  releases?: VestingLog[]
  previousUpdate?: Omit<UpdateAttributes, 'id' | 'proposal_id'>
  currentUpdate?: Omit<UpdateAttributes, 'id' | 'proposal_id'>
  disclosedFunds: number
}

function FinancialCardsSection({ releases, previousUpdate, currentUpdate, disclosedFunds }: Props) {
  const t = useFormatMessage()
  const {
    value: releasedFundsValue,
    txAmount,
    latestTimestamp,
  } = getFundsReleasedSinceLatestUpdate(previousUpdate, releases, currentUpdate?.completion_date)
  const undisclosedFunds = disclosedFunds <= releasedFundsValue ? releasedFundsValue - disclosedFunds : 0
  const { formatNumber } = useIntl()
  return (
    <div className="FinancialCardsSection__CardsContainer">
      <FinancialCard
        type="income"
        title={t('page.proposal_update.funds_released_label')}
        value={releasedFundsValue}
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
        value={disclosedFunds}
        subtitle={t('page.proposal_update.funds_disclosed_sublabel', {
          funds: formatNumber(undisclosedFunds, CURRENCY_FORMAT_OPTIONS),
        })}
      />
    </div>
  )
}

export default FinancialCardsSection
