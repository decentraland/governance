import { CLIFF_PERIOD_IN_DAYS } from '../../../entities/Proposal/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
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
