import useFormatMessage from '../../../hooks/useFormatMessage'
import Text from '../../Common/Typography/Text'
import PeaceCircle from '../../Icon/PeaceCircle'

import './EmptyView.css'

function EmptyView() {
  const t = useFormatMessage()
  return (
    <div className="NotificationsFeed__EmptyView">
      <PeaceCircle />
      <Text color="secondary" weight="medium">
        {t('navigation.notifications.empty')}
      </Text>
    </div>
  )
}

export default EmptyView
