import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Empty } from 'decentraland-ui/dist/components/Empty/Empty'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown, DropdownProps } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './HomePage.types'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { WrappingSummary } from 'components/Wrapping/WrappingSummary'
import { ProposalSummary } from 'components/Proposal/ProposalSummary'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { locations } from 'routing/locations'
import { HeaderMenu } from 'decentraland-ui/dist/components/HeaderMenu/HeaderMenu'
import { NewProposalModal } from 'components/Proposal/NewProposalModal'
import { ProposalCategory, ProposalStatus } from 'modules/proposal/types'
import { FilterProposalParams } from 'routing/types'
import './HomePage.css'

export default class HomePage extends React.PureComponent<Props, any> {

  handleCreateProposal = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    this.props.onChangeParams({
      ...{
        status: this.props.params.status
      } as FilterProposalParams,
      modal: 'new'
    })
  }

  handleChangeStatusFilter = (event: React.SyntheticEvent<any>, props: DropdownProps) => {
    event.preventDefault()
    const status = this.props.params.status || ProposalStatus.All
    if (props.value !== status) {
      this.props.onChangeParams({
        ...this.props.params,
        status: props.value as any
      })
    }
  }
  handleChangeCategoryFilter = (event: React.SyntheticEvent<any>, props: DropdownProps) => {
    event.preventDefault()
    const category = this.props.params.category || ProposalCategory.All
    if (props.value !== category) {
      this.props.onChangeParams({
        ...this.props.params,
        category: props.value as any
      })
    }
  }

  renderStatusOptions() {
    const { params } = this.props
    const status = params.status || ProposalStatus.All
    const options = [
      { key: ProposalStatus.All, value: ProposalStatus.All, text: t(`proposals_page.filter_status_all`) },
      { key: ProposalStatus.Enacted, value: ProposalStatus.Enacted, text: t(`proposals_page.filter_status_enacted`) },
      { key: ProposalStatus.Passed, value: ProposalStatus.Passed, text: t(`proposals_page.filter_status_passed`) },
      { key: ProposalStatus.Rejected, value: ProposalStatus.Rejected, text: t(`proposals_page.filter_status_rejected`) },
      { key: ProposalStatus.Progress, value: ProposalStatus.Progress, text: t(`proposals_page.filter_status_progress`) }
    ]

    const option = options.find(option => option.value === status) || options[0]
    const text = option.value === ProposalCategory.All ?
      t('proposals_page.filter_status') :
      t('proposals_page.filter_status_selected', { status: option.text })

    return <Dropdown
      direction="left"
      value={option.value}
      text={text}
      onChange={this.handleChangeStatusFilter}
      options={options}
    />
  }

  renderCategoryOptions() {
    const { params } = this.props
    const category = params.category || ProposalCategory.All
    const options = [
      { key: ProposalCategory.All, value: ProposalCategory.All, text: t(`proposals_page.filter_category_all`) },
      { key: ProposalCategory.Question, value: ProposalCategory.Question, text: t(`proposals_page.filter_category_question`) },
      { key: ProposalCategory.Tokens, value: ProposalCategory.Tokens, text: t(`proposals_page.filter_category_tokens`) },
      { key: ProposalCategory.Delay, value: ProposalCategory.Delay, text: t(`proposals_page.filter_category_delay`) },
      { key: ProposalCategory.Catalyst, value: ProposalCategory.Catalyst, text: t(`proposals_page.filter_category_catalyst`) },
      { key: ProposalCategory.Finance, value: ProposalCategory.Finance, text: t(`proposals_page.filter_category_finance`) },
      { key: ProposalCategory.Agent, value: ProposalCategory.Agent, text: t(`proposals_page.filter_category_agent`) },
      { key: ProposalCategory.BanName, value: ProposalCategory.BanName, text: t(`proposals_page.filter_category_ban_name`) },
      { key: ProposalCategory.POI, value: ProposalCategory.POI, text: t(`proposals_page.filter_category_poi`) },
      { key: ProposalCategory.System, value: ProposalCategory.System, text: t(`proposals_page.filter_category_system`) }
    ]

    const option = options.find(option => option.value === category) || options[0]
    const text = option.value === ProposalCategory.All ?
      t('proposals_page.filter_category') :
      t('proposals_page.filter_category_selected', { category: option.text })

    return <Dropdown
      direction="left"
      value={option.value}
      text={text}
      onChange={this.handleChangeCategoryFilter}
      options={options}
    />
  }

  render() {
    const { isLoading, proposals } = this.props

    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Proposals} />
      <Page className="HomePage">
        <Grid stackable>
          <Grid.Row>
            <Grid.Column mobile="5">
              <HeaderMenu >
                <HeaderMenu.Left>
                  <Header sub>
                    <b>{t('proposals_page.wrapping_header')}</b>
                  </Header>
                </HeaderMenu.Left>
              </HeaderMenu>
              <WrappingSummary />
            </Grid.Column>
            <Grid.Column mobile="11">
              <HeaderMenu >
                <HeaderMenu.Left>
                  <Header sub><b>{t('proposals_page.proposals_header', { proposals: proposals?.length || 0 })}</b></Header>
                </HeaderMenu.Left>
                <HeaderMenu.Right>
                  {this.renderStatusOptions()}
                </HeaderMenu.Right>
                <HeaderMenu.Right>
                  {this.renderCategoryOptions()}
                </HeaderMenu.Right>
                <HeaderMenu.Right>
                  <Button as="a" href={locations.root({ modal: 'new' })} onClick={this.handleCreateProposal} primary size="small">{t('proposals_page.create_proposal')}</Button>
                </HeaderMenu.Right>
              </HeaderMenu>
              {isLoading && <Loader size="huge" active/>}
              {!isLoading && (!proposals || proposals.length === 0) && <Empty height={100}>{t('proposals_page.empty')}</Empty>}
              {!isLoading && proposals && proposals.length > 0 && proposals.map(proposal => <ProposalSummary key={proposal.id} proposal={proposal}/>)}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page>
      <NewProposalModal />
      <Footer />
      </>
  }
}
