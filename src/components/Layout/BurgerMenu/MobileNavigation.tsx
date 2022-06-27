import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import prevent from 'decentraland-gatsby/dist/utils/react/prevent'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import locations from '../../../modules/locations'
import { NavigationProps, NavigationTab } from '../Navigation'

import './MobileNavigation.css'

function getProps(tab: NavigationTab, activeTab?: NavigationTab) {
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
          {...getProps(NavigationTab.Proposals, activeTab)}
          as={Link}
          href={locations.proposals()}
          onClick={prevent(() => {
            navigate(locations.proposals())
          })}
        >
          {t('navigation.proposals')}
        </Button>
        <Button
          className="Browse__Button"
          size="small"
          {...getProps(NavigationTab.Grants, activeTab)}
          as={Link}
          href={locations.grants()}
          onClick={prevent(() => {
            navigate(locations.grants())
          })}
        >
          {t('navigation.grants')}
        </Button>
        <Button
          className="Browse__Button"
          size="small"
          {...getProps(NavigationTab.Transparency, activeTab)}
          as={Link}
          href={locations.transparency()}
          onClick={prevent(() => {
            navigate(locations.transparency())
          })}
        >
          {t('navigation.transparency')}
        </Button>
      </div>
    </div>
  )
}

export default React.memo(MobileNavigation)
