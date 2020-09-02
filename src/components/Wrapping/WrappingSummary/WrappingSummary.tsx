import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
// import { Page } from 'decentraland-ui/dist/components/Page/Page'
// import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
// import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './WrappingSummary.types'
// import Navbar from 'components/Navbar/Navbar'
// import Footer from 'components/Footer/Footer'
// import { Navigation } from 'components/Navigation'
// import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './WrappingSummary.css'
import { VotingPower } from '../VotingPower'

const signIn = require('../../../images/sign-in.svg')
const manaIcon = require('../../../images/mana.svg')
const landIcon = require('../../../images/land.svg')
const estateIcon = require('../../../images/estate.svg')

export default class WrappingSummary extends React.PureComponent<Props, any> {

  renderLoading() {
    return <Card.Content textAlign="center" className="SignInContent">
      <Loader size="huge" active/>
    </Card.Content>
  }

  renderSignIn() {
    const { isConnecting } = this.props
    return <Card.Content textAlign="center" className="SignInContent">
    <img src={signIn} />
    <p>{t("general.sign_in_detail")}</p>
    <Button primary size="small" loading={isConnecting} onClick={this.props.onConnect}>
      {t("general.sign_in")}
    </Button>
  </Card.Content>
  }

  renderVotingPower() {
    return <>
      <Card.Content>
          <Header sub>{t('general.total')}</Header>
          <VotingPower size="big" />
      </Card.Content>
      <Card.Content>
        <Header sub>{t('general.total')}</Header>
        <div className="WrappingSummarySection">
          <div className="WrappingSummaryValue">
            <img src={landIcon} width="36" height="36" />
            <div>10 Land</div>
          </div>
          <VotingPower secondary />
        </div>
        <div className="WrappingSummarySection">
          <div className="WrappingSummaryValue">
            <img src={estateIcon} width="36" height="36" />
            <div>2 Estate</div>
          </div>
          <VotingPower secondary />
        </div>
        <div className="WrappingSummarySection">
          <div className="WrappingSummaryValue">
            <img src={manaIcon} width="36" height="36" />
            <div>Mana</div>
          </div>
          <VotingPower secondary />
        </div>
      </Card.Content>
    </>
  }

  render() {
    const { isLoading, isConnected } = this.props

    return <Card className="WrappingSummary">

      {isLoading && this.renderLoading()}

      {!isLoading && !isConnected && this.renderSignIn()}

      {!isLoading && isConnected && this.renderVotingPower()}
    </Card>
  }
}
