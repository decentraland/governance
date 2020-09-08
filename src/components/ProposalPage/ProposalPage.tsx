import React from 'react'
import { Link } from 'react-router-dom'
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
import { locations } from 'routing/locations'

import './ProposalPage.css'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ProposalHistory } from 'components/Proposal/ProposalHistory'
import { ProposalStatus } from 'components/Proposal/ProposalStatus'
import { CREATOR_NAME, AppName } from 'modules/app/types'
import { getVoteTimeLeft, getVotePercentages } from 'modules/vote/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

export default class ProposalPage extends React.PureComponent<Props, any> {
  render() {

    const { isLoading, vote } = this.props
    const description = vote?.metadata || vote?.description
    const creator: keyof typeof CREATOR_NAME = vote?.creator as any
    const balance: Partial<ReturnType<typeof getVotePercentages>> = vote ? getVotePercentages(vote) : {}

    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Proposals} />
      <Page className="ProposalPage">
        <div className="ProposalPageBack">
          <Link to={locations.root()}>
            <Back />
          </Link>
        </div>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column mobile="11" className="ProposalTitle">
              {isLoading && <Loader active size="medium" />}
              {!isLoading && <Header sub={!description}>{description || 'No description'}</Header>}
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
                      <Grid.Column mobile="4">
                        <Header sub>{t('proposal_detail_page.category')}</Header>
                        <Header>{CREATOR_NAME[creator] || AppName.Voting}</Header>
                      </Grid.Column>
                      <Grid.Column mobile="4">
                        <Header sub>{t('proposal_detail_page.left')}</Header>
                        <Header>{getVoteTimeLeft(vote) || 'None'}</Header>
                      </Grid.Column>
                      <Grid.Column mobile="4">
                        <Header sub>{t('proposal_detail_page.support')}</Header>
                        <Header>{balance.supportPct || 0} %</Header>
                        <span>{t('proposal_detail_page.needed', { needed: balance.supportRequiredPct || 0 })}</span>
                      </Grid.Column>
                      <Grid.Column mobile="4">
                        <Header sub>{t('proposal_detail_page.approval')}</Header>
                        <Header>{balance.acceptPct || 0} %</Header>
                        <span>{t('proposal_detail_page.needed', { needed: balance.acceptRequiredPct || 0 })}</span>
                      </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                      <Grid.Column mobile="16">
                        <ProposalStatus.Progress vote={vote} full />
                      </Grid.Column>
                    </Grid.Row>

                    <Grid.Row className="ProposalActions">
                      <Grid.Column mobile="6">
                        <ProposalStatus.Approval vote={vote} />
                      </Grid.Column>
                      <Grid.Column mobile="5">
                        <Button inverted>Vote YES</Button>
                      </Grid.Column>
                      <Grid.Column mobile="5">
                        <Button inverted>Vote NO</Button>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Card.Content>
                <Card.Content className="DetailProgressBar">
                  <Header sub>{t('proposal_detail_page.description')}</Header>
                </Card.Content>
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
