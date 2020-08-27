import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import Routes from './Routes'

const mapState = (_: any) => ({})

const mapDispatch = (_: any) => ({})

const connected = connect(
  mapState,
  mapDispatch
)(Routes)

export default withRouter(connected as any)
