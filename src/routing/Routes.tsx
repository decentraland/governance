import * as React from 'react'
import { Switch, Redirect, Route } from 'react-router-dom'
import { env } from 'decentraland-commons'
import { Intercom } from 'decentraland-dapps/dist/components'

import { locations } from 'routing/locations'
import HomePage from 'components/HomePage'
import ProposalPage from 'components/ProposalPage'
import WrappingPage from 'components/WrappingPage'
import DebugPage from 'components/DebugPage/DebugPage'

const INTERCOM_APP_ID = env.get('REACT_APP_INTERCOM_APP_ID', '')

export default class Routes extends React.PureComponent<any, any> {

  render() {
    return (<>
      <Switch>
        <Route exact path={locations.root()} component={HomePage} />
        <Route exact path={locations.proposal()} component={ProposalPage} />
        <Route exact path={locations.wrapping()} component={WrappingPage} />
        <Route exact path={locations.debug()} component={DebugPage} />
        <Redirect to={locations.root()} />
      </Switch>
      <Intercom appId={INTERCOM_APP_ID} settings={{ alignment: 'right' }} />
    </>)
  }
}
