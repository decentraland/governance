import { connect } from 'react-redux'
import { RootState } from 'modules/root/types'
import { getData } from 'modules/wallet/selectors'
import { getAddress, isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getData as getProfiles } from 'decentraland-dapps/dist/modules/profile/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './Navbar.types'
import { getLocation, push } from 'connected-react-router'
import Navbar from './Navbar'

const mapState = (state: RootState): MapStateProps => {
  const address = getAddress(state)
  const profile = address ? getProfiles(state)[address] : undefined
  return ({
    pathname: getLocation(state).pathname,
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    wallet: getData(state),
    profile,
    address,
  })
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (target: string) => dispatch(push(target))
})

export default connect(mapState, mapDispatch)(Navbar)
