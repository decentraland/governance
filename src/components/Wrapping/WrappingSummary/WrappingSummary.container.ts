import { connect } from 'react-redux'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import { isLoading, getData } from 'modules/wallet/selectors'
import WrappingSummary from './WrappingSummary'
import { MapDispatchProps, MapStateProps, MapDispatch } from './WrappingSummary.types'
import { push, replace } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isEnabling: isEnabling(state),
  isLoading: isConnecting(state) || isEnabling(state) || isLoading(state),
  wallet: getData(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest()),
  onNavigate: (href: string, r: boolean = false) => dispatch(r ? replace(href) : push(href))
})

export default connect(mapState, mapDispatch)(WrappingSummary)
