import { connect } from 'react-redux'

import { RootState } from 'modules/root/types'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Navigation.types'
import Navigation from './Navigation'
import { getNetwork } from 'modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => ({
  network: getNetwork(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Navigation)
