import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './ProposalPage.types'
import Navbar from 'components/Navbar/Navbar'
import Footer from 'components/Footer/Footer'

export default class ProposalPage extends React.PureComponent<Props, any> {
  render() {
    return <>
      <Navbar />
      <Page>
      <Grid>
        <Grid.Row>
          <Grid.Column></Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid.Row>
      </Grid>
    </Page>
      <Footer />
      </>
  }
}
