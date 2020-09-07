import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { Props } from './WrappingPage.types'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { HeaderMenu } from 'decentraland-ui/dist/components/HeaderMenu/HeaderMenu'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import Token from 'components/Token'
import './WrappingPage.css'
import { SignInPage } from 'decentraland-dapps/dist/containers'
import { env } from 'decentraland-commons'

const BUY_MANA_URL = env.get('REACT_APP_BUY_MANA_URL', '#')
const BUY_LAND_URL = env.get('REACT_APP_BUY_LAND_URL', '#')

export default class WrappingPage extends React.PureComponent<Props, any> {

  handleRegisterLandBalance = () => {
    const wallet = this.props.wallet!
    if (!wallet.landCommit && this.props.onRegisterLand) {
      this.props.onRegisterLand()
    }
  }

  handleRegisterEstateBalance = () => {
    const wallet = this.props.wallet!
    if (!wallet.estateCommit && this.props.onRegisterEstate) {
      this.props.onRegisterEstate()
    }
  }

  renderTotal() {
    const { isLoading } = this.props
    const wallet = this.props.wallet!

    return <Grid stackable className="WrappingAmount">
      <Grid.Row>
        <Grid.Column mobile="8">
          <Header sub><b>{t('wrapping_page.total')}</b></Header>
          {isLoading && <Loader size="medium" active inline />}
          {!isLoading && <Token size="huge" symbol="VP" value={wallet.votingPower} />}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  }

  renderWrapMana() {
    const { isLoading } = this.props
    const wallet = this.props.wallet!
    return <>
      <HeaderMenu>
        <HeaderMenu.Left>
          <Header sub><b>{t('wrapping_page.mana_title')}</b></Header>
        </HeaderMenu.Left>
        <HeaderMenu.Right>
          <Button as='a' basic size="small" href={BUY_MANA_URL} target={'_blank'}>
            {t('wrapping_page.get_mana')}
            <Icon name="chevron right" />
          </Button>
        </HeaderMenu.Right>
      </HeaderMenu>
      <Card>
        {isLoading && <Loader size="medium" active />}
        {!isLoading && <Card.Content>
          <Header><b>{t('wrapping_page.mana_title')}</b></Header>
          <Header sub>{t('wrapping_page.mana_wrapped')}</Header>
          <Token symbol="VP" size="medium" value={wallet.manaVotingPower} />
        </Card.Content>}
        {!isLoading && <Card.Content>
          <Header sub>{t('wrapping_page.mana_available')}</Header>
          <Token symbol="MANA" size="medium" value={wallet.mana} />
          <Header sub>{t('wrapping_page.mana_rate')}</Header>
        </Card.Content>}
      </Card>
    </>
  }

  renderWrapLand() {
    const { isLoading, isRegisteringLand } = this.props
    const wallet = this.props.wallet!

    return <>
      <HeaderMenu>
        <HeaderMenu.Left>
          <Header sub><b>{t('wrapping_page.land_title')}</b></Header>
        </HeaderMenu.Left>
      </HeaderMenu>
      <Card>
        {isLoading && <Loader size="medium" active />}
        {!isLoading && <Card.Content style={{ flexGrow: 1 }}>
          <Header><b>{t('wrapping_page.land_title')}</b></Header>

          <Header sub>{t('wrapping_page.land_balance')}</Header>
          <Header>{t('general.land', { land: wallet.land })}</Header>

          <Header sub>{t('wrapping_page.land_total')}</Header>
          <Token symbol="VP" size="medium" value={wallet.landVotingPower} />
        </Card.Content>}
        {!isLoading && <Card.Content>
          {isRegisteringLand && <Loader active inline size="small" />}
          {!isRegisteringLand && <Radio toggle label={t('wrapping_page.land_commit')} checked={wallet.landCommit} onClick={this.handleRegisterLandBalance} />}
        </Card.Content>}
      </Card>
    </>
  }

  renderWrapEstate() {
    const { isLoading, isRegisteringEstate } = this.props
    const wallet = this.props.wallet!

    return <>
      <HeaderMenu>
        <HeaderMenu.Left>{null}</HeaderMenu.Left>
        <HeaderMenu.Right>
          <Button as='a' basic size="small" href={BUY_LAND_URL} target={'_blank'}>
            {t('wrapping_page.get_land')}
            <Icon name="chevron right" />
          </Button>
        </HeaderMenu.Right>
      </HeaderMenu>
      <Card>
        {isLoading && <Loader size="medium" active />}
        {!isLoading && <Card.Content style={{ flexGrow: 1 }}>
          <Header><b>{t('wrapping_page.estate_title')}</b></Header>

          <Header sub>{t('wrapping_page.estate_balance')}</Header>
          <Header>{t('general.estate', { estate: wallet.estate || 0 })}</Header>

          <Header sub>{t('wrapping_page.estate_composition')}</Header>
          <Header>{t('general.land', { land: wallet.estateSize || 0 })}</Header>

          <Header sub>{t('wrapping_page.estate_total')}</Header>
          <Token symbol="VP" size="medium" value={wallet.estateVotingPower} />
        </Card.Content>}
        {!isLoading && <Card.Content>
          {isRegisteringEstate && <Loader inline active size="small" />}
          {!isRegisteringEstate && <Radio toggle label={t('wrapping_page.estate_commit')} checked={wallet.estateCommit} onClick={this.handleRegisterEstateBalance}/>}
        </Card.Content>}
      </Card></>
  }

  render() {
    const { isConnected, isLoading } = this.props

    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Wrapping} />
      {!isLoading && !isConnected && <Page className="WrappingPage"><SignInPage /></Page>}
      {(isLoading || isConnected) && <Page className="WrappingPage">
        {this.renderTotal()}
        <Grid stackable stretched className="WrappingOptions">
          <Grid.Row>
            <Grid.Column>
              {this.renderWrapMana()}
            </Grid.Column>
            <Grid.Column>
              {this.renderWrapLand()}
            </Grid.Column>
            <Grid.Column>
              {this.renderWrapEstate()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page>}
      <Footer />
    </>
  }
}
