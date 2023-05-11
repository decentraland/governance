import React, { useMemo, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import useIsDebugAddress from '../../hooks/useIsDebugAddress'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import locations from '../../modules/locations'
import Dot from '../Icon/Dot'
import SearchInput from '../Search/SearchInput'

import './Navigation.css'

export enum NavigationTab {
  Home = 'home',
  Proposals = 'proposals',
  Profile = 'profile',
  Enacted = 'enacted',
  Transparency = 'transparency',
  Grants = 'grants',
  Debug = 'debug',
}

export type NavigationProps = {
  activeTab?: NavigationTab
}

const POP_UP_LOCAL_STORAGE_KEY = 'org.decentraland.governance.profile-pop-up-dismissed'

const Navigation = ({ activeTab }: NavigationProps) => {
  const t = useFormatMessage()
  const [user] = useAuthContext()

  const { isDebugAddress } = useIsDebugAddress(user)
  const isProfileValidated = useIsProfileValidated(user)
  const [isDismissClicked, setIsDismissClicked] = useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isPopUpDismissed = useMemo(() => !!localStorage.getItem(POP_UP_LOCAL_STORAGE_KEY), [isDismissClicked])
  const handleDismissClick = () => {
    localStorage.setItem(POP_UP_LOCAL_STORAGE_KEY, 'true')
    setIsDismissClicked(true)
  }
  const showDot = isProfileValidated !== null && !isProfileValidated

  return (
    <div className="Navigation">
      <Tabs>
        <Tabs.Left>
          <Link href={locations.home()}>
            <Tabs.Tab active={activeTab === NavigationTab.Home}>{t('navigation.home')}</Tabs.Tab>
          </Link>
          <Link href={locations.proposals()}>
            <Tabs.Tab active={activeTab === NavigationTab.Proposals}>{t('navigation.proposals')}</Tabs.Tab>
          </Link>
          <Link href={locations.grants()}>
            <Tabs.Tab active={activeTab === NavigationTab.Grants}>{t('navigation.grants')}</Tabs.Tab>
          </Link>
          {user && (
            <Link href={locations.profile({ address: user })}>
              <Popup
                content={
                  <div className="NavigationProfilePopUp">
                    <p>{t('navigation.profile_pop_up.label')}</p>
                    <Button
                      basic
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDismissClick()
                      }}
                    >
                      {t('navigation.profile_pop_up.button')}
                    </Button>
                  </div>
                }
                position="bottom center"
                trigger={
                  <Tabs.Tab active={activeTab === NavigationTab.Profile}>
                    {t('navigation.profile')}
                    {showDot && <Dot />}
                  </Tabs.Tab>
                }
                open={showDot && !isPopUpDismissed}
              />
            </Link>
          )}
          <Link href={locations.transparency()}>
            <Tabs.Tab active={activeTab === NavigationTab.Transparency}>{t('navigation.transparency')}</Tabs.Tab>
          </Link>
          {user && isDebugAddress && (
            <Link href={locations.debug()}>
              <Tabs.Tab active={activeTab === NavigationTab.Debug}>{t('navigation.debug')}</Tabs.Tab>
            </Link>
          )}
        </Tabs.Left>
        <Tabs.Right>
          <SearchInput />
        </Tabs.Right>
      </Tabs>
    </div>
  )
}

export default React.memo(Navigation)
