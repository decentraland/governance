import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './ProposalPage.types'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ProposalHistory } from 'components/Proposal/ProposalHistory'
import { ProposalStatus } from 'components/Proposal/ProposalStatus'
import { AppName } from 'modules/app/types'
import { getVoteTimeLeft, getVoteUrl } from 'modules/vote/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ProposalTitle } from 'components/Proposal/ProposalTitle'
import { ProposalSupportModal } from 'components/Proposal/ProposalSupportModal'
import { env } from 'decentraland-commons'
import { getVoteInitialAddress } from 'modules/description/utils'
import { getAppName } from 'modules/app/utils'
import inspect from 'util-inspect'
import { AggregatedVote, VoteStatus } from 'modules/vote/types'
import './ProposalPage.css'
import { locations } from 'routing/locations'

export default class ProposalPage extends React.PureComponent<Props, any> {

  componentDidMount() {
    if (this.props.vote && !Array.isArray(this.props.casts)) {
      this.props.onRequireCasts([ this.props.vote.id ])
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.vote && this.props.vote !== prevProps.vote) {
      this.props.onRequireCasts([ this.props.vote.id ])
    }
  }

  handleWrap = () => {
    this.props.onNavigate(locations.wrapping())
  }

  handleApprove = () => {
    if (this.props.vote) {
      this.props.onNavigate(getVoteUrl(this.props.vote, { modal: 'vote', support: true }), true)
    }
  }

  handleReject = () => {
    if (this.props.vote) {
      this.props.onNavigate(getVoteUrl(this.props.vote, { modal: 'vote', support: false }), true)
    }
  }

  render() {
    const { isLoading, isPending, vote, description, casts, cast, wallet } = this.props
    const loadingCast = !casts || (!cast && isPending)
    const votingPower = wallet?.votingPower || 0
    const balance = vote?.balance || {} as Partial<AggregatedVote['balance']>
    const expired = vote?.status !== VoteStatus.Progress

    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Proposals} />
      <Page className="ProposalPage">
        <ProposalSupportModal vote={vote} />
        <div className="ProposalPageBack">
            <Back onClick={this.props.onBack} />
        </div>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column mobile="16" className="ProposalTitle">
              <ProposalTitle vote={vote} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column mobile="11">
              <Header sub>{t('proposal_detail_page.description')}</Header>
              {isLoading && <Card>
                <Loader active size="medium" />
              </Card>}
              {!isLoading && vote && <Card>
                <Card.Content>
                  <Grid stackable>
                    <Grid.Row className="ProposalDetail">
                      <Grid.Column mobile="3">
                        <Header sub>{t('proposal_detail_page.category')}</Header>
                        {!!vote.metadata && <Header>{AppName.Question}</Header>}
                        {!vote.metadata && <Header>{getAppName(getVoteInitialAddress(description)) || AppName.System}</Header>}
                      </Grid.Column>
                      <Grid.Column mobile="4">
                        <Header sub>{t('proposal_detail_page.left')}</Header>
                        <Header>{getVoteTimeLeft(vote) || 'None'}</Header>
                      </Grid.Column>
                      <Grid.Column mobile="4">
                        <Header sub>{t('proposal_detail_page.support')}</Header>
                        <Header>{balance.supportPercentage || 0} %</Header>
                        <span>{t('proposal_detail_page.needed', { needed: balance.supportRequiredPercentage || 0 })}</span>
                      </Grid.Column>
                      <Grid.Column mobile="5">
                        <Header sub>{t('proposal_detail_page.approval')}</Header>
                        <Header>{balance.acceptPercentage || 0} %</Header>
                        <span>{t('proposal_detail_page.needed', { needed: balance.acceptRequiredPercentage || 0 })}</span>
                      </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                      <Grid.Column mobile="16">
                        <ProposalStatus.Progress vote={vote} full />
                      </Grid.Column>
                    </Grid.Row>

                    <Grid.Row className="ProposalActions">
                      <Grid.Column mobile="7">
                        <ProposalStatus.Approval vote={vote} />
                      </Grid.Column>
                      {loadingCast && <Grid.Column mobile="9">
                        <Button inverted loading={true} className="pending">loading</Button>
                      </Grid.Column>}
                      {!loadingCast && votingPower === 0 && <Grid.Column mobile="9">
                        <Button inverted className="pending" onClick={this.handleWrap}>{t('proposal_detail_page.wrap')}</Button>
                      </Grid.Column>}
                      {!loadingCast && votingPower > 0 && !cast && <Grid.Column mobile="9">
                        <div className="VotePending">
                          <Button inverted disabled={expired} className="pending" onClick={this.handleApprove}>Vote YES</Button>
                          <Button inverted disabled={expired} className="pending" onClick={this.handleReject}>Vote NO</Button>
                        </div>
                      </Grid.Column>}
                      {!loadingCast && votingPower > 0 && cast && cast.supports && <Grid.Column mobile="9">
                        <Button inverted disabled={expired} className="yea">Voted YES</Button>
                      </Grid.Column>}
                      {!loadingCast && votingPower > 0 && cast && !cast.supports && <Grid.Column mobile="9">
                        <Button inverted disabled={expired} className="nay">Voted NO</Button>
                      </Grid.Column>}
                    </Grid.Row>
                  </Grid>
                </Card.Content>
                {/* <Card.Content className="DetailDescription">
                  <Header sub>{t('proposal_detail_page.description')}</Header>
                </Card.Content> */}
                {env.isDevelopment() && <Card.Content className="DetailDebug">
                  <Header sub>INFO</Header>
                  <div className="DetailDebugContainer">
                    <pre>{inspect(vote, null ,2)}</pre>
                  </div>
                  <div className="DetailDebugContainer">
                    <pre>{JSON.stringify(description, null ,2)}</pre>
                  </div>
                </Card.Content>}
              </Card>}
            </Grid.Column>
            <Grid.Column mobile="5">
              <Header sub>{t('proposal_detail_page.history')}</Header>
              {isLoading && <Card><Loader active size="medium" /></Card>}
              {!isLoading && vote && <ProposalHistory vote={vote} />}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page>
      <Footer />
    </>
  }
}
