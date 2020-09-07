import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Props } from './WrappingSummary.types'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import VotingPower from 'components/Token/VotingPower'
import Token from 'components/Token'
import WrappingSummarySection from './WrappingSummarySection'
import './WrappingSummary.css'

const signIn = require('../../../images/sign-in.svg')
const manaIcon = require('../../../images/mana.svg')
const landIcon = require('../../../images/land.svg')
const estateIcon = require('../../../images/estate.svg')

export default class WrappingSummary extends React.PureComponent<Props, any> {

  renderLoading() {
    return <Card.Content textAlign="center" className="SignInContent">
      <Loader size="huge" active />
    </Card.Content>
  }

  renderSignIn() {
    const { isConnecting, isEnabling } = this.props

    return <Card.Content textAlign="center" className="SignInContent">
      <img src={signIn} />
      <p>{t("general.sign_in_detail")}</p>
      <Button primary size="small" loading={isConnecting || isEnabling} onClick={this.props.onConnect}>
        {t("general.sign_in")}
      </Button>
    </Card.Content>
  }

  renderVotingPower() {

    const wallet = this.props.wallet!

    return <>
      <Card.Content>
        <Header sub><b>{t('general.total')}</b></Header>
        <VotingPower value={wallet.votingPower} size="large" />
      </Card.Content>
      <Card.Content>
        <Header sub><b>{t('general.total')}</b></Header>
        <WrappingSummarySection icon={landIcon} label={t('general.land', { land: wallet.land })}>
          <Token symbol="VP" size="small" secondary value={wallet.landVotingPower} />
        </WrappingSummarySection>
        <WrappingSummarySection icon={estateIcon} label={t('general.estate', { estate: wallet.estate })}>
          <Token symbol="VP" size="small" secondary value={wallet.estateVotingPower} />
        </WrappingSummarySection>
        <WrappingSummarySection icon={manaIcon} label={t('general.mana')}>
          <Token symbol="VP" size="small" secondary value={wallet.manaMiniMe} />
        </WrappingSummarySection>
      </Card.Content>
    </>
  }

  render() {
    const { isConnected, isConnecting, isEnabling, isLoading } = this.props
    const loading = isConnecting || isEnabling || isLoading

    return <Card className="WrappingSummary">

      {loading && this.renderLoading()}

      {!loading && !isConnected && this.renderSignIn()}

      {!loading && isConnected && this.renderVotingPower()}
    </Card>
  }
}
