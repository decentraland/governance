import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { Props, State } from './WrappingPage.types'
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
import WrappingInput from 'components/Wrapping/WrappingInput'
import UnwrapModal from 'components/Wrapping/UnwrapModal'
import { locations } from 'routing/locations'

const BUY_MANA_URL = env.get('REACT_APP_BUY_MANA_URL', '#')
const BUY_LAND_URL = env.get('REACT_APP_BUY_LAND_URL', '#')

export default class WrappingPage extends React.PureComponent<Props, State> {

  handleChangeWrapValue = (event: React.FormEvent<HTMLInputElement>) => {
    const raw = String(event.currentTarget.value || '')
    if (raw === '') {
      return this.setState({ value: '' })
    }

    const value = Number(raw.replace(/\D/gi, ''))
    if (Number.isNaN(value)) {
      return this.setState({ value: '' })
    }

    this.setState({ value })
  }

  handleWrapMana = () => {
    if (
      this.state.value &&
      this.state.value > 0 &&
      this.props.onWrapMana
    ) {
      this.props.onWrapMana(this.state.value)
    }
  }

  handleUnwrapMana = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    const wallet = this.props.wallet
    this.props.onNavigate(locations.wrapping({ modal: 'unwrap', amount: wallet?.manaVotingPower || 0 }))
  }

  handleCommitManaBalance = () => {
    const wallet = this.props.wallet!
    if (!wallet.manaCommit && this.props.onAllowMana) {
      this.props.onAllowMana()
    }
  }

  handleCommitLandBalance = () => {
    const wallet = this.props.wallet
    if (wallet) {
      if (wallet.landCommit) {
        this.props.onRevokeLand()
      } else {
        this.props.onAllowLand()
      }
    }
  }

  handleCommitEstateBalance = () => {
    const wallet = this.props.wallet
    if (wallet) {
      if (wallet.estateCommit) {
        this.props.onRevokeEstate()
      } else {
        this.props.onAllowEstate()
      }
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
    const { isLoading, isAllowingMana } = this.props
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
          <HeaderMenu>
            <HeaderMenu.Left>
              <Header sub>{t('wrapping_page.mana_wrapped')}</Header>
            </HeaderMenu.Left>
            {!!wallet.manaMiniMe && <HeaderMenu.Right>
              <Button
                as='a'
                basic
                size="small"
                onClick={this.handleUnwrapMana}
                loading={this.props.isConnecting || this.props.isWrappingMana || this.props.isUnwrappingMana}
                href={locations.wrapping({ modal: 'unwrap' })}
              >
                {t('wrapping_page.mana_unwrap')}
              </Button>
            </HeaderMenu.Right>}
          </HeaderMenu>
          <Token symbol="VP" size="medium" value={wallet.manaVotingPower} />
        </Card.Content>}
        {!isLoading && <Card.Content style={{ flexGrow: 1 }}>
          <Header sub>{t('wrapping_page.mana_available')}</Header>
          <Token symbol="MANA" size="medium" value={wallet.mana} />
          {wallet.manaCommit && <Header sub>{t('wrapping_page.mana_rate')}</Header>}
          {wallet.manaCommit && <WrappingInput min={0} max={wallet.mana} value={this.state?.value || ''} onChange={this.handleChangeWrapValue}/>}
          {wallet.manaCommit && <Button
            primary
            size="small"
            disabled={this.props.isConnecting || this.props.isWrappingMana || this.props.isUnwrappingMana || !this.state?.value}
            loading={this.props.isConnecting || this.props.isWrappingMana || this.props.isUnwrappingMana}
            onClick={this.handleWrapMana}
        >{t('wrapping_page.mana_wrap')}</Button>}
        </Card.Content>}
        {!isLoading && !wallet.manaCommit && <Card.Content>
          {isAllowingMana && <Loader inline active size="small" />}
          {!isAllowingMana && <Radio toggle label={t('wrapping_page.mana_commit')} checked={wallet.manaCommit} onClick={this.handleCommitManaBalance}/>}
        </Card.Content>}
      </Card>
    </>
  }

  renderWrapLand() {
    const { isLoading, isAllowingLand, isRevokingLand } = this.props
    const loading = isAllowingLand || isRevokingLand
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
        {!isLoading && <Card.Content style={{ flexGrow: 0 }}>
          {loading && <Loader active inline size="small" />}
          {!loading && <Radio toggle label={t('wrapping_page.land_commit')} checked={wallet.landCommit} onClick={this.handleCommitLandBalance} />}
        </Card.Content>}
      </Card>
    </>
  }

  renderWrapEstate() {
    const { isLoading, isAllowingEstate, isRevokingEstate } = this.props
    const loading = isAllowingEstate || isRevokingEstate
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
          {loading && <Loader inline active size="small" />}
          {!loading && <Radio toggle label={t('wrapping_page.estate_commit')} checked={wallet.estateCommit} onClick={this.handleCommitEstateBalance}/>}
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
        <UnwrapModal />
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
