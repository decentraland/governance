import { connect } from 'react-redux'

import { RootState } from 'modules/root/types'
import { getNetwork } from 'modules/wallet/selectors'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Navigation.types'
import Navigation from './Navigation'

const mapState = (state: RootState): MapStateProps => ({
  network: getNetwork(state),
  isConnected: isConnected(state),
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Navigation)
