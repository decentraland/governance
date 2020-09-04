import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Props } from './WrappingSummary.types'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './WrappingSummary.css'
import VotingPower from 'components/Token/VotingPower'
import Token from 'components/Token'
import WrappingSummarySection from './WrappingSummarySection'

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
          <Header sub><b>{t('general.total')}</b></Header>
          <VotingPower size="large" />
      </Card.Content>
      <Card.Content>
        <Header sub><b>{t('general.total')}</b></Header>
        <WrappingSummarySection icon={landIcon} label={t('general.land', { land: 0 })}>
          <Token symbol="VP" size="small" secondary />
        </WrappingSummarySection>
        <WrappingSummarySection icon={estateIcon} label={t('general.estate', { estate: 0 })}>
          <Token symbol="VP" size="small" secondary />
        </WrappingSummarySection>
        <WrappingSummarySection icon={manaIcon} label={t('general.mana')}>
          <Token symbol="VP" size="small" secondary />
        </WrappingSummarySection>
      </Card.Content>
    </>
  }

  render() {
    const { isConnected, isConnecting } = this.props

    return <Card className="WrappingSummary">

      {isConnecting && this.renderLoading()}

      {!isConnecting && !isConnected && this.renderSignIn()}

      {!isConnecting && isConnected && this.renderVotingPower()}
    </Card>
  }
}
