import React from 'react'
// import {HeaderMenu} from 'semantic-ui-react/dist/commonjs/'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
// import { Page } from 'decentraland-ui/dist/components/Page/Page'
// import { HeaderMenu } from 'decentraland-ui/dist/components/HeaderMenu/HeaderMenu'
// import { Header } from 'decentraland-ui/dist/components/Header/Header'
// import { Button } from 'decentraland-ui/dist/components/Button/Button'
// import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './ProposalSummary.types'
// import Navbar from 'components/Navbar/Navbar'
// import Footer from 'components/Footer/Footer'
// import { Navigation } from 'components/Navigation'
// import { NavigationTab } from 'components/Navigation/Navigation.types'
// import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ProposalStatus } from '../ProposalStatus'
import './ProposalSummary.css'

export default class ProposalSummary extends React.PureComponent<Props, any> {

  render() {
    const { vote, app } = this.props
    return <Card className="ProposalSummary">
      <Card.Content>
      <Card.Header>{vote.description}</Card.Header>
        <pre style={{ overflow: 'auto' }}>{JSON.stringify({ organization: app.organization.address, address: app.address }, null, 2)}</pre>
        <pre style={{ overflow: 'auto' }}>{JSON.stringify(vote, null, 2)}</pre>
        <div className="ProposalSummaryActions">
          <div><ProposalStatus vote={vote} /></div>
          <div></div>
        </div>
      </Card.Content>
    </Card>
  }
}
