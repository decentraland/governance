import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { Governance } from '../../clients/Governance'
import { NotificationType } from '../../utils/notifications'
import Heading from '../Common/Typography/Heading'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function Notifications({ className }: Props) {
  const [notificationType, setNotificationType] = useState(NotificationType.TARGET)
  const [notificationAddress, setNotificationAddress] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationBody, setNotificationBody] = useState('')
  const [notificationURL, setNotificationURL] = useState('')
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  const handleSendNotification = async (e: any) => {
    e.preventDefault()
    setIsSendingNotification(true)

    try {
      await Governance.get().sendNotification(
        notificationAddress,
        notificationTitle,
        notificationBody,
        notificationType,
        notificationURL
      )
      setNotificationAddress('')
      setNotificationTitle('')
      setNotificationBody('')
      setNotificationURL('')
    } catch (error) {
      console.log('Error sending notification', error)
    }

    setIsSendingNotification(false)
  }

  return (
    <div className={className}>
      <ContentSection>
        <form onSubmit={handleSendNotification}>
          <Heading size="sm">Send announcement notification</Heading>
          <SelectField
            value={notificationType}
            onChange={(_, { value }) => setNotificationType(Number(value))}
            options={[
              { text: 'Target', value: NotificationType.TARGET },
              { text: 'Broadcast', value: NotificationType.BROADCAST },
            ]}
          />
          {notificationType === NotificationType.TARGET && (
            <Field
              value={notificationAddress}
              required
              placeholder="Address (0x...)"
              onChange={(e) => setNotificationAddress(e.target.value)}
            />
          )}
          <Field
            value={notificationTitle}
            required
            placeholder="Title"
            onChange={(e) => setNotificationTitle(e.target.value)}
          />
          <Field
            value={notificationBody}
            required
            placeholder="Body"
            onChange={(e) => setNotificationBody(e.target.value)}
          />
          <Field value={notificationURL} placeholder="URL" onChange={(e) => setNotificationURL(e.target.value)} />
          <Button primary loading={isSendingNotification}>
            Send
          </Button>
        </form>
      </ContentSection>
    </div>
  )
}
