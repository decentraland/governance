import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Empty } from 'decentraland-ui/dist/components/Empty/Empty'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './HomePage.types'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { WrappingSummary } from 'components/Wrapping/WrappingSummary'
import { ProposalSummary } from 'components/Proposal/ProposalSummary'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './HomePage.css'

export default class HomePage extends React.PureComponent<Props, any> {
  render() {
    const { isLoading, votes } = this.props
    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Proposals} />
      <Page className="HomePage">
        <Grid stackable>
          <Grid.Row>
            <Grid.Column mobile="5">
              <Header sub>{t('proposals_page.wrapping_header')}</Header>
              <WrappingSummary />
            </Grid.Column>
            <Grid.Column mobile="11">
              <Header sub>{t('proposals_page.proposals_header', { proposals: votes?.length || 0 })}</Header>
              {isLoading && <Loader size="huge" active/>}
              {!isLoading && (!votes || votes.length === 0) && <Empty height={100}>{t('proposals_page.empty')}</Empty>}
              {!isLoading && votes && votes.length > 0 && votes.map(vote => <ProposalSummary key={vote.id} vote={vote}/>)}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page>
      <Footer />
      </>
  }
}
