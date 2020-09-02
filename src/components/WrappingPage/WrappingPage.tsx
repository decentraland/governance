import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './WrappingPage.types'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'

export default class WrappingPage extends React.PureComponent<Props, any> {
  render() {
    const { isLoading } = this.props
    return <>
      <Navbar />
      <Navigation activeTab={NavigationTab.Wrapping} />
      <Page>
        {isLoading && <Loader size="huge" active />}
        {!isLoading && <Grid>
          <Grid.Row>
            <Grid.Column></Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
        </Grid>}
      </Page>
      <Footer />
      </>
  }
}
