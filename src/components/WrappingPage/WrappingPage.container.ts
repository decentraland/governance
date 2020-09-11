import { connect } from 'react-redux'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'

import WrappingPage from './WrappingPage'
import { RootState } from 'modules/root/types'
import { MapDispatchProps, MapStateProps, MapDispatch } from './WrappingPage.types'
import { getData, isLoading, isRegisteringEstate, isRegisteringLand, isWrappingMana, isUnwrappingMana, isRegisterLandPending, isRegisterEstatePending, isWrapManaPending, isUnwrapManaPending } from 'modules/wallet/selectors'
import { registerLandBalanceRequest, registerEstateBalanceRequest, wrapManaRequest } from 'modules/wallet/actions'
import { push } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => {
  return ({
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isEnabling: isEnabling(state),
    isLoading: isConnecting(state) || isEnabling(state) || isLoading(state),
    isRegisteringLand: isRegisteringLand(state) || isRegisterLandPending(state),
    isRegisteringEstate: isRegisteringEstate(state) || isRegisterEstatePending(state),
    isWrappingMana: isWrappingMana(state) || isWrapManaPending(state),
    isUnwrappingMana: isUnwrappingMana(state) || isUnwrapManaPending(state),
    wallet: getData(state)
  })
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onNavigate: (href: string) => dispatch(push(href)),
  onWrapToken: (amount) => dispatch(wrapManaRequest(amount)),
  onUnwrapToken: (amount) => dispatch(wrapManaRequest(amount)),
  onRegisterLand: () => dispatch(registerLandBalanceRequest()),
  onRegisterEstate: () => dispatch(registerEstateBalanceRequest())
})

export default connect(mapState, mapDispatch)(WrappingPage)
