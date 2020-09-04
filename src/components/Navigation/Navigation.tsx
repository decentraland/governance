import React from 'react'
import { Link } from 'react-router-dom'
import { Tabs, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from '../../routing/locations'
import { Props, NavigationTab } from './Navigation.types'
import { NetworkName, Network } from 'modules/wallet/types'
import './Navigation.css'

const Navigation = (props: Props) => {
  const { activeTab, network } = props
  return (
    <Tabs>
      <Tabs.Left>
        <Link to={locations.root()}>
          <Tabs.Tab active={activeTab === NavigationTab.Proposals}>
            {t('navigation.proposals')}
          </Tabs.Tab>
        </Link>
        <Link to={locations.wrapping()}>
          <Tabs.Tab active={activeTab === NavigationTab.Wrapping}>
            {t('navigation.wrapping')}
          </Tabs.Tab>
        </Link>
      </Tabs.Left>
      {network && network !== Network.MAINNET && <Tabs.Right>
        <Tabs.Tab>
          <Header sub>{NetworkName[network]}</Header>
        </Tabs.Tab>
      </Tabs.Right>}
    </Tabs>
  )
}

export default React.memo(Navigation)
