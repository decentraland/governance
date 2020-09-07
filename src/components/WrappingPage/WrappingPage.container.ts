import { connect } from 'react-redux'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import WrappingPage from './WrappingPage'
import { MapDispatchProps, MapStateProps, MapDispatch } from './WrappingPage.types'
import { getData, isLoading, isRegisteringEstate, isRegisteringLand } from 'modules/wallet/selectors'
import { registerLandBalanceRequest, registerEstateBalanceRequest} from 'modules/wallet/actions'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isEnabling: isEnabling(state),
  isLoading: isConnecting(state) || isEnabling(state) || isLoading(state),
  isRegisteringLand: isRegisteringLand(state),
  isRegisteringEstate: isRegisteringEstate(state),
  wallet: getData(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onRegisterLand: () => dispatch(registerLandBalanceRequest()),
  onRegisterEstate: () => dispatch(registerEstateBalanceRequest())
})

export default connect(mapState, mapDispatch)(WrappingPage)
