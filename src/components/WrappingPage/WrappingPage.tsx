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

export default class WrappingPage extends React.PureComponent<Props, any> {

  renderTotal() {
    const { isConnecting } = this.props

    return <Grid stackable className="WrappingAmount">
      <Grid.Row>
        <Grid.Column mobile="8">
          <Header sub><b>{t('wrapping_page.total')}</b></Header>
          {isConnecting && <Loader size="medium" active inline />}
          {!isConnecting && <Token size="huge" symbol="VP" />}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  }

  renderWrapMana() {
    const { isConnecting } = this.props
    return <>
      <HeaderMenu>
        <HeaderMenu.Left>
          <Header sub><b>{t('wrapping_page.mana_title')}</b></Header>
        </HeaderMenu.Left>
        <HeaderMenu.Right>
          <Button basic size="small">
            {t('wrapping_page.get_mana')}
            <Icon name="chevron right" />
          </Button>
        </HeaderMenu.Right>
      </HeaderMenu>
      <Card>
        {isConnecting && <Loader size="medium" active />}
        {!isConnecting && <Card.Content>
          <Header><b>{t('wrapping_page.mana_title')}</b></Header>
          <Header sub>{t('wrapping_page.mana_wrapped')}</Header>
          <Token symbol="VP" value={0} size="medium" />
        </Card.Content>}
        {!isConnecting && <Card.Content>
          <Header sub>{t('wrapping_page.mana_available')}</Header>
          <Token symbol="MANA" value={0} size="medium" />
          <Header sub>{t('wrapping_page.mana_rate')}</Header>
        </Card.Content>}
      </Card>
    </>
  }

  renderWrapLand() {
    const { isConnecting } = this.props
    return <>
      <HeaderMenu>
        <HeaderMenu.Left>
          <Header sub><b>{t('wrapping_page.land_title')}</b></Header>
        </HeaderMenu.Left>
      </HeaderMenu>
      <Card>
        {isConnecting && <Loader size="medium" active />}
        {!isConnecting && <Card.Content style={{ flexGrow: 1 }}>
          <Header><b>{t('wrapping_page.land_title')}</b></Header>

          <Header sub>{t('wrapping_page.land_balance')}</Header>
          <Header>{t('general.land', { land: 0 })}</Header>

          <Header sub>{t('wrapping_page.land_total')}</Header>
          <Token symbol="VP" value={0} size="medium" />
        </Card.Content>}
        {!isConnecting && <Card.Content>
          <Radio toggle label={t('wrapping_page.land_commit')} />
        </Card.Content>}
      </Card>
    </>
  }

  renderWrapEstate() {
    const { isConnecting } = this.props
    return <>
      <HeaderMenu>
        <HeaderMenu.Left>{null}</HeaderMenu.Left>
        <HeaderMenu.Right>
          <Button basic size="small">
            {t('wrapping_page.get_land')}
            <Icon name="chevron right" />
          </Button>
        </HeaderMenu.Right>
      </HeaderMenu>
      <Card>
        {isConnecting && <Loader size="medium" active />}
        {!isConnecting && <Card.Content style={{ flexGrow: 1 }}>
          <Header><b>{t('wrapping_page.estate_title')}</b></Header>

          <Header sub>{t('wrapping_page.estate_balance')}</Header>
          <Header>{t('general.estate', { estate: 0 })}</Header>

          <Header sub>{t('wrapping_page.estate_composition')}</Header>
          <Header>{t('general.land', { land: 0 })}</Header>

          <Header sub>{t('wrapping_page.estate_total')}</Header>
          <Token symbol="VP" value={0} size="medium" />
        </Card.Content>}
        {!isConnecting && <Card.Content>
          <Radio toggle label={t('wrapping_page.land_commit')} />
        </Card.Content>}
      </Card></>
  }

  render() {
    const { isConnecting, isConnected } = this.props

    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Wrapping} />
      {!isConnecting && !isConnected && <SignInPage />}
      {(isConnecting || isConnected) && <Page className="WrappingPage">
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
