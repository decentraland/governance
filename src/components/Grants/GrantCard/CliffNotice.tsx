import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { CLIFF_PERIOD_IN_DAYS } from '../../../entities/Proposal/utils'
import DateTooltip from '../../Common/DateTooltip'
import InfoCircle from '../../Icon/InfoCircle'

import './CliffNotice.css'

interface Props {
  vestingStartDate: number
}

const CliffNotice = ({ vestingStartDate }: Props) => {
  const t = useFormatMessage()
  const cliffEndsDate = Time.unix(vestingStartDate).add(CLIFF_PERIOD_IN_DAYS, 'day')
  const formattedCompletionDate = cliffEndsDate.format('MMMM DD, YYYY')

  return (
    <div className="CliffNotice">
      <div className="CliffNotice__IconContainer">
        <InfoCircle size="16" />
      </div>
      <div className="CliffNotice__Description">
        <span>{t('page.grants.cliff_notice')}</span>
        <span>
          <DateTooltip date={cliffEndsDate.toDate()}>{formattedCompletionDate}</DateTooltip>
        </span>
      </div>
    </div>
  )
}

export default CliffNotice
