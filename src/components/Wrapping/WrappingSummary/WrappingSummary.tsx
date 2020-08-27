import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
// import { Page } from 'decentraland-ui/dist/components/Page/Page'
// import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
// import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './WrappingSummary.types'
// import Navbar from 'components/Navbar/Navbar'
// import Footer from 'components/Footer/Footer'
// import { Navigation } from 'components/Navigation'
// import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './WrappingSummary.css'

const signIn = require('../../../images/sign-in.svg')

export default class WrappingSummary extends React.PureComponent<Props, any> {
  render() {
    const { isLoading, isConnecting, isConnected } = this.props

    return <Card className="WrappingSummary">
      {isLoading && <Card.Content textAlign="center" className="SignInContent">
        <Loader size="huge" active/>
      </Card.Content>}
      {!isLoading && !isConnected && <Card.Content textAlign="center" className="SignInContent">
        <img src={signIn} />
        <p>{t("general.sign_in_detail")}</p>
        <Button primary size="small" loading={isConnecting} onClick={this.props.onConnect}>
          {t("general.sign_in")}
        </Button>
      </Card.Content>}
      {isConnected && <Card.Content></Card.Content>}
    </Card>

    // return <>
    //   <Navbar />
    //   <Navigation activeTab={NavigationTab.Proposals} />
    //   <Page>
    //     {isLoading && <Loader size="huge" active/>}
    //     {!isLoading && <Grid stackable >
    //       <Grid.Row>
    //         <Grid.Column mobile="4">
    //         <Header sub>{t('proposals.wrapping_header')}</Header>
    //         </Grid.Column>
    //         <Grid.Column mobile="8">
    //         <Header sub>{t('proposals.proposals_header', { proposals: votes?.length || 0 })}</Header>
    //         </Grid.Column>
    //       </Grid.Row>
    //     </Grid>}
    //   </Page>
    //   <Footer />
    //   </>
  }
}
