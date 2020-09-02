import { connect } from 'react-redux'

import { RootState } from 'modules/root/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Navbar.types'
import Navbar from './Navbar'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest())
})

export default connect(mapState, mapDispatch)(Navbar)
