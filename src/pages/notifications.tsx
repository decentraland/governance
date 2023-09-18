import React, { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { Governance } from '../clients/Governance'
import Heading from '../components/Common/Typography/Heading'
import LogIn from '../components/Layout/LogIn'
import useIsDebugAddress from '../hooks/useIsDebugAddress'
import { NotificationType } from '../utils/notifications'

import './debug.css'

export default function DebugPage() {
  const [user] = useAuthContext()
  const { isDebugAddress } = useIsDebugAddress(user)
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

  if (!user || !isDebugAddress) {
    return <LogIn title={'test'} description={'test'} />
  }

  return (
    <Container className="DebugPage">
      <form onSubmit={handleSendNotification}>
        <Heading size="md">Send notification</Heading>
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
        <Field
          value={notificationURL}
          required
          placeholder="URL"
          onChange={(e) => setNotificationURL(e.target.value)}
        />
        <Button loading={isSendingNotification}>Send</Button>
      </form>
    </Container>
  )
}
