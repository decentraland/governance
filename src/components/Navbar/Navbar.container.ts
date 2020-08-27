import { connect } from 'react-redux'
// import { push, getLocation } from 'connected-react-router'

import { RootState } from 'modules/root/types'
// import { getTransactions } from '../../modules/transaction/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Navbar.types'
import Navbar from './Navbar'
// import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'

const mapState = (_state: RootState): MapStateProps => ({
  // pathname: getLocation(state).pathname,
  // hasPendingTransactions: getTransactions(state).some(tx =>
  //   isPending(tx.status)
  // )
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({
  // onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(Navbar)
