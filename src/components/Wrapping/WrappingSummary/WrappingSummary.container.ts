import { connect } from 'react-redux'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import WrappingSummary from './WrappingSummary'
import { MapDispatchProps, MapStateProps, MapDispatch } from './WrappingSummary.types'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest())
})

export default connect(mapState, mapDispatch)(WrappingSummary)
