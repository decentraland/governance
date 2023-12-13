import useCountdown from '../../../hooks/useCountdown'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import Text from '../../Common/Typography/Text'

import './ProposalPromotionCountdown.css'

export default function ProposalPromotionCountdown({ startAt }: { startAt: string | Date }) {
  const t = useFormatMessage()
  const { days, hours, minutes, seconds, time } = useCountdown(Time(startAt))

  if (time <= 0) {
    return null
  }

  return (
    <Text className="ProposalPromotionCountdown" size="xs">
      {t('page.proposal_detail.promotion.submit_countdown', { value: `${days}:${hours}:${minutes}:${seconds}` })}
    </Text>
  )
}
