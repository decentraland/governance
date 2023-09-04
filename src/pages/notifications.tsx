import React, { useState } from 'react'

import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { Governance } from '../clients/Governance'
import Heading from '../components/Common/Typography/Heading'
import Label from '../components/Common/Typography/Label'
import LogIn from '../components/User/LogIn'
import useIsDebugAddress from '../hooks/useIsDebugAddress'
import { getCaipAddress } from '../utils/notifications'

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
  const [notificationAddress, setNotificationAddress] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationBody, setNotificationBody] = useState('')
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  const { data: subscriptions } = useQuery({
    queryKey: [`subscriptions#${user}`],
    queryFn: () =>
      user ? PushAPI.user.getSubscriptions({ user: getCaipAddress(user, CHAIN_ID), env: ENV.STAGING }) : null,
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

  const handleNotificationSend = async (e: any) => {
    e.preventDefault()
    setIsSendingNotification(true)
    try {
      await Governance.get().sendNotification(notificationAddress, notificationTitle, notificationBody)
      setNotificationAddress('')
      setNotificationTitle('')
      setNotificationBody('')
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
      <form onSubmit={handleNotificationSend}>
        <Label>Send notification to user:</Label>
        <Field required placeholder="Address (0x...)" onChange={(e) => setNotificationAddress(e.target.value)} />
        <Field required placeholder="Title" onChange={(e) => setNotificationTitle(e.target.value)} />
        <Field required placeholder="Body" onChange={(e) => setNotificationBody(e.target.value)} />
        <Button loading={isSendingNotification}>Send notification</Button>
      </form>
    </Container>
  )
}
