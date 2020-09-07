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
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { getVoteUrl } from 'modules/vote/utils'

export default class ProposalSummary extends React.PureComponent<Props, any> {

  handleClick = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    const url = getVoteUrl(this.props.vote)
    if (url) {
      this.props.onNavigate(url)
    }
  }

  render() {
    const { vote } = this.props
    const url = getVoteUrl(this.props.vote)
    return <Card as="a" className="ProposalSummary" href={url} onClick={this.handleClick}>
      <Card.Content>
        <Card.Header>
          <div>
            {vote.metadata || vote.description || <Header sub>No description</Header>}
          </div>
          <ProposalStatus.Creator vote={vote} />
        </Card.Header>
        <div className="ProposalSummaryActions">
          <div><ProposalStatus vote={vote} /></div>
        </div>
      </Card.Content>
    </Card>
  }
}
