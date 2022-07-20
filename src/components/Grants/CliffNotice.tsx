import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { CLIFF_PERIOD_IN_DAYS } from '../../entities/Proposal/utils'
import DateTooltip from '../Common/DateTooltip'
import InfoCircle from '../Icon/InfoCircle'

import './CliffNotice.css'

interface Props {
  vesting_start_date: number
}

const CliffNotice = ({ vesting_start_date }: Props) => {
  const t = useFormatMessage()
  const cliff_ends_date = Time.unix(vesting_start_date).add(CLIFF_PERIOD_IN_DAYS, 'day')
  const formattedCompletionDate = cliff_ends_date.format('MMMM DD, YYYY')

  return (
    <div className="CliffNotice">
      <div className="CliffNotice__Left">
        <div className="CliffNotice__IconContainer">
          <InfoCircle size="16" />
        </div>
        <div className="CliffNotice__Description">
          <span>{t('page.grants.cliff_notice')}</span>
          <span>
            <DateTooltip date={cliff_ends_date.toDate()}>{formattedCompletionDate}</DateTooltip>
          </span>
        </div>
      </div>
    </div>
  )
}

export default CliffNotice
