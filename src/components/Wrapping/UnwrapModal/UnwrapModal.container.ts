import { connect } from 'react-redux'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import UnwrapModal from './UnwrapModal'
import { MapDispatchProps, MapStateProps, MapDispatch } from './UnwrapModal.types'
import { push } from 'connected-react-router'
import { getUnwrapParams } from 'routing/selectors'
import { isWrappingMana, isUnwrappingMana, getData } from 'modules/wallet/selectors'
import { unwrapManaRequest } from 'modules/wallet/actions'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isWrappingMana: isWrappingMana(state),
  isUnwrappingMana: isUnwrappingMana(state),
  params: getUnwrapParams(state),
  wallet: getData(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string) => dispatch(push(href)),
  onUnwrapToken: (amount) => dispatch(unwrapManaRequest(amount))
})

export default connect(mapState, mapDispatch)(UnwrapModal)
