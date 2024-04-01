import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Heading from '../../Common/Typography/Heading'
import Text from '../../Common/Typography/Text'
import SignGray from '../../Icon/SignGray'

import './UnsubscribedView.css'

interface Props {
  subscriptionState: 'subscribing' | 'success' | 'error' | null
  onErrorClick: () => void
}

function UnsubscribedView({ subscriptionState, onErrorClick }: Props) {
  const t = useFormatMessage()

  const isSubscribing = subscriptionState === 'subscribing'
  const hasError = subscriptionState === 'error'

  return (
    <Modal.Content>
      <div className="NotificationsFeed__UnsubscribedView">
        <SignGray size="124" />
        <Heading className="NotificationsFeed__UnsubscribedViewHeading" size="sm">
          {t(`navigation.notifications.subscribing.title`)}
        </Heading>
        <Text className="NotificationsFeed__UnsubscribedViewText">
          {t(`navigation.notifications.subscribing.description`)}
        </Text>
        <Button size="small" primary disabled={isSubscribing} onClick={onErrorClick}>
          {t(`navigation.notifications.${subscriptionState}.button`)}
        </Button>
        {hasError && (
          <Text size="sm" color="error" className="NotificationsFeed__UnsubscribedViewText">
            {t(`navigation.notifications.error.description`)}
          </Text>
        )}
      </div>
    </Modal.Content>
  )
}

export default UnsubscribedView
