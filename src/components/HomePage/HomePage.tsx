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
import { VoteStatus } from 'modules/vote/types'
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

  handleChangeFilters = (event: React.SyntheticEvent<any>, props: DropdownProps) => {
    event.preventDefault()
    const status = this.props.params.status || VoteStatus.All
    if (props.value !== status) {
      this.props.onChangeParams({
        status: props.value as any
      })
    }
  }

  render() {
    const { isLoading, votes, params } = this.props
    const status = params.status || VoteStatus.All
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
                  <Header sub><b>{t('proposals_page.proposals_header', { proposals: votes?.length || 0 })}</b></Header>
                </HeaderMenu.Left>
                <HeaderMenu.Right>
                  <Dropdown
                    direction="left"
                    value={status}
                    text={`${status} status`}
                    onChange={this.handleChangeFilters}
                    options={[
                      { key: VoteStatus.All, value: VoteStatus.All, text: t(`general.${VoteStatus.All}`) },
                      { key: VoteStatus.Enacted, value: VoteStatus.Enacted, text: t(`general.${VoteStatus.Enacted}`) },
                      { key: VoteStatus.Passed, value: VoteStatus.Passed, text: t(`general.${VoteStatus.Passed}`) },
                      { key: VoteStatus.Rejected, value: VoteStatus.Rejected, text: t(`general.${VoteStatus.Rejected}`) },
                      { key: VoteStatus.Progress, value: VoteStatus.Progress, text: t(`general.${VoteStatus.Progress}`) }
                    ]}
                  />
                </HeaderMenu.Right>
                <HeaderMenu.Right>
                  <Button as="a" href={locations.root({ modal: 'new' })} onClick={this.handleCreateProposal} primary size="small">{t('proposals_page.create_proposal')}</Button>
                </HeaderMenu.Right>
              </HeaderMenu>
              {isLoading && <Loader size="huge" active/>}
              {!isLoading && (!votes || votes.length === 0) && <Empty height={100}>{t('proposals_page.empty')}</Empty>}
              {!isLoading && votes && votes.length > 0 && votes
                .filter(vote => status === VoteStatus.All || vote.status === status)
                .map(vote => <ProposalSummary key={vote.id} vote={vote}/>)
              }
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page>
      <NewProposalModal />
      <Footer />
      </>
  }
}
