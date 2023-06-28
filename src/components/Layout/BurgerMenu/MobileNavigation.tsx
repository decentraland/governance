import React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import useFormatMessage from '../../../hooks/useFormatMessage'
import locations from '../../../utils/locations'
import Link from '../../Common/Link'
import { NavigationProps, NavigationTab } from '../Navigation'

import './MobileNavigation.css'

function getButtonProps(tab: NavigationTab, activeTab?: NavigationTab) {
  if (activeTab === tab) {
    return { inverted: true, primary: true }
  } else {
    return { secondary: true }
  }
}

function MobileNavigation({ activeTab }: NavigationProps) {
  const t = useFormatMessage()

  return (
    <div className="MobileNavigation">
      <Header sub className="Browse__header">
        {t(`page.proposal_list.browse`)}
      </Header>
      <div className={'Browse__Buttons'}>
        <Button
          className="Browse__Button"
          size="small"
          {...getButtonProps(NavigationTab.Home, activeTab)}
          as={Link}
          href={locations.home()}
        >
          {t('navigation.home')}
        </Button>
        <Button
          className="Browse__Button"
          size="small"
          {...getButtonProps(NavigationTab.Proposals, activeTab)}
          as={Link}
          href={locations.proposals()}
        >
          {t('navigation.proposals')}
        </Button>
        <Button
          className="Browse__Button"
          size="small"
          {...getButtonProps(NavigationTab.Grants, activeTab)}
          as={Link}
          href={locations.grants()}
        >
          {t('navigation.grants')}
        </Button>
        <Button
          className="Browse__Button"
          size="small"
          {...getButtonProps(NavigationTab.Transparency, activeTab)}
          as={Link}
          href={locations.transparency()}
        >
          {t('navigation.transparency')}
        </Button>
      </div>
    </div>
  )
}

export default React.memo(MobileNavigation)
