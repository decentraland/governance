import { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import BoxTabs from '../components/Common/BoxTabs'
import Heading from '../components/Common/Typography/Heading'
import Text from '../components/Common/Typography/Text'
import WiderContainer from '../components/Common/WiderContainer'
import BadgesAdmin from '../components/Debug/BadgesAdmin'
import BudgetsUpdate from '../components/Debug/BudgetsUpdate'
import EnvStatus from '../components/Debug/EnvStatus'
import ErrorReporting from '../components/Debug/ErrorReporting'
import HttpStatus from '../components/Debug/HttpStatus'
import Notifications from '../components/Debug/Notifications'
import Snapshot from '../components/Debug/Snapshot'
import TriggerFunction from '../components/Debug/TriggerFunction'
import LogIn from '../components/Layout/LogIn'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import useIsDebugAddress from '../hooks/useIsDebugAddress'

import './debug.css'

enum Panel {
  Admin = 'Admin',
  Debug = 'Debug',
}

export default function DebugPage() {
  const [account] = useAuthContext()
  const { isDebugAddress } = useIsDebugAddress(account)
  const [activePanel, setActivePanel] = useState(Panel.Admin)
  const isAdminActive = activePanel === Panel.Admin
  const isDebugActive = activePanel === Panel.Debug

  if (!account || !isDebugAddress) {
    return <LogIn title={'test'} description={'test'} />
  }

  return (
    <>
      <Navigation activeTab={NavigationTab.Debug} />
      <WiderContainer className="DebugPage">
        <Heading size="sm">{'Version'}</Heading>
        <Text>{process.env.GATSBY_VERSION_NUMBER}</Text>
        <div className="DebugTabs">
          <BoxTabs>
            <BoxTabs.Left>
              <BoxTabs.Tab active={isAdminActive} onClick={() => setActivePanel(Panel.Admin)}>
                {Panel.Admin}
              </BoxTabs.Tab>
              <BoxTabs.Tab active={isDebugActive} onClick={() => setActivePanel(Panel.Debug)}>
                {Panel.Debug}
              </BoxTabs.Tab>
            </BoxTabs.Left>
          </BoxTabs>
        </div>
        {isAdminActive && (
          <>
            <BudgetsUpdate className="DebugPage__Section" />
            <BadgesAdmin className="DebugPage__Section" />
            <TriggerFunction className="DebugPage__Section" />
            <Notifications className="DebugPage__Section" />
          </>
        )}
        {isDebugActive && (
          <>
            <ErrorReporting className="DebugPage__Section" />
            <HttpStatus className="DebugPage__Section" />
            <EnvStatus className="DebugPage__Section" />
            <Snapshot className="DebugPage__Section" />
          </>
        )}
      </WiderContainer>
    </>
  )
}
