import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import HttpStatus from '../components/Debug/HttpStatus'
import SnapshotStatus from '../components/Debug/SnapshotStatus'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import LogIn from '../components/User/LogIn'
import useIsDebugAddress from '../hooks/useIsDebugAddress'

import './debug.css'

export default function DebugPage() {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { isDebugAddress } = useIsDebugAddress(account)

  if (!account || !isDebugAddress) {
    return <LogIn title={'test'} description={'test'} />
  }

  return (
    <Container className="DebugPage">
      <Navigation activeTab={NavigationTab.Debug} />
      <Header size="huge">{t('page.debug.title')}</Header>
      <HttpStatus className="DebugPage__Section" />
      <SnapshotStatus className="DebugPage__Section" />
    </Container>
  )
}
