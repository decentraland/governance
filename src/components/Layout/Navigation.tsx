import React, { useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import useIsDebugAddress from '../../hooks/useIsDebugAddress'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import locations from '../../utils/locations'
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

const PROFILE_POP_UP_LOCAL_STORAGE_KEY = 'org.decentraland.governance.profile-pop-up-dismissed'

type DismissState = {
  isDismissClicked: boolean
  isPopUpDismissed: boolean
}

const Navigation = ({ activeTab }: NavigationProps) => {
  const t = useFormatMessage()
  const [user] = useAuthContext()

  const { isDebugAddress } = useIsDebugAddress(user)
  const { isProfileValidated, validationChecked } = useIsProfileValidated(user)
  const [dismissState, setDismissState] = useState<DismissState>({
    isDismissClicked: false,
    isPopUpDismissed: false,
  })

  useEffect(
    () =>
      setDismissState((prev) => ({
        ...prev,
        isPopUpDismissed: !!localStorage.getItem(PROFILE_POP_UP_LOCAL_STORAGE_KEY),
      })),
    [dismissState.isDismissClicked]
  )

  const handleDismissClick = () => {
    localStorage.setItem(PROFILE_POP_UP_LOCAL_STORAGE_KEY, 'true')
    setDismissState((prev) => ({ ...prev, isDismissClicked: true }))
  }
  const showDot = validationChecked && !isProfileValidated

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
                style={{ zIndex: 1000 }}
                className="NavigationProfilePopUp"
                content={
                  <div>
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
                open={showDot && !dismissState.isPopUpDismissed}
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
