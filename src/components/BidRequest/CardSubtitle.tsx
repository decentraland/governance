import { useIntl } from 'react-intl'

import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Markdown from '../Common/Typography/Markdown'
import CheckCircleOutline from '../Icon/CheckCircleOutline'

import './CardSubtitle.css'

export default function CardSubtitle({
  votingPower,
  finishAt,
  isLoading,
}: {
  votingPower?: number
  finishAt: Date
  isLoading: boolean
}) {
  const t = useFormatMessage()
  const { formatNumber } = useIntl()

  return (
    <span className="CardSubtitle">
      {!isLoading && (
        <>
          <CheckCircleOutline size="14" />
          <Markdown size="sm" componentsClassNames={{ p: 'CardSubtitle__Text', strong: 'CardSubtitle__Text' }}>
            {t('page.submit_bid.parent_vp', {
              votingPower: formatNumber(votingPower || 0),
              date: Time(finishAt).fromNow(),
            })}
          </Markdown>
        </>
      )}
      {isLoading && (
        <span className="CardSubtitle__Loader">
          <Loader active size="tiny" />
        </span>
      )}
    </span>
  )
}
