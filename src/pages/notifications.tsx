import React, { useState } from 'react'

import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { Governance } from '../clients/Governance'
import Heading from '../components/Common/Typography/Heading'
import Text from '../components/Common/Typography/Text'
import LogIn from '../components/User/LogIn'
import useIsDebugAddress from '../hooks/useIsDebugAddress'
import { NotificationType, getCaipAddress } from '../utils/notifications'

import './debug.css'

enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
}

const CHAIN_ID = 5
const CHANNEL_ADDRESS = '0xBf363AeDd082Ddd8DB2D6457609B03f9ee74a2F1'

export default function DebugPage() {
  const [user, userState] = useAuthContext()
  const { isDebugAddress } = useIsDebugAddress(user)
  const [notificationType, setNotificationType] = useState(NotificationType.TARGET)
  const [notificationAddress, setNotificationAddress] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationBody, setNotificationBody] = useState('')
  const [notificationURL, setNotificationURL] = useState('')
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  const { data: subscriptions } = useQuery({
    queryKey: [`subscriptions#${user}`],
    queryFn: () =>
      user ? PushAPI.user.getSubscriptions({ user: getCaipAddress(user, CHAIN_ID), env: ENV.STAGING }) : null,
    enabled: !!user,
  })

  const { data: userNotifications } = useQuery({
    queryKey: [`notifications#${user}`],
    queryFn: () => (user ? Governance.get().getUserNotifications(user) : null),
    enabled: !!user,
  })

  const handleSubscribeUserToChannel = async () => {
    if (!user || !userState.provider) {
      return
    }

    const signer = new Web3Provider(userState.provider).getSigner()

    await PushAPI.channels.subscribe({
      signer,
      channelAddress: getCaipAddress(CHANNEL_ADDRESS, CHAIN_ID),
      userAddress: getCaipAddress(user, CHAIN_ID),
      onSuccess: () => {
        console.log('opt in success')
      },
      onError: () => {
        console.error('opt in error')
      },
      env: ENV.STAGING,
    })
  }

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

  const isSubscribed = !!subscriptions?.find((item: any) => item.channel === CHANNEL_ADDRESS)

  return (
    <Container className="DebugPage">
      <Heading>Notifications</Heading>
      <Button style={{ marginBottom: '25px' }} disabled={isSubscribed} onClick={handleSubscribeUserToChannel}>
        Subscribe to Decentraland DAO Push channel
      </Button>
      {userNotifications && (
        <div style={{ marginBottom: '25px' }}>
          <Heading size="md">Your notifications</Heading>
          {userNotifications?.map((notification) => (
            <div
              key={notification.payload_id}
              style={{
                border: '1px solid var(--black-400)',
                padding: '6px',
                marginBottom: '6px',
                borderRadius: '12px',
              }}
            >
              <Text>{notification.payload.data.asub}</Text>
              <Text>{notification.payload.data.amsg}</Text>
            </div>
          ))}
        </div>
      )}
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
        <Field value={notificationURL} placeholder="URL" onChange={(e) => setNotificationURL(e.target.value)} />
        <Button loading={isSendingNotification}>Send</Button>
      </form>
    </Container>
  )
}
