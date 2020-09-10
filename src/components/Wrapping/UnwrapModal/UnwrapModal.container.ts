import { connect } from 'react-redux'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import UnwrapModal from './UnwrapModal'
import { MapDispatchProps, MapStateProps, MapDispatch } from './UnwrapModal.types'
import { push } from 'connected-react-router'
import { getQuery } from 'routing/selectors'
import { isWrappingMana, isUnwrappingMana } from 'modules/wallet/selectors'
import { unwrapManaRequest } from 'modules/wallet/actions'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isWrappingMana: isWrappingMana(state),
  isUnwrappingMana: isUnwrappingMana(state),
  params: getQuery(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string) => dispatch(push(href)),
  onUnwrapToken: (amount) => dispatch(unwrapManaRequest(amount))
})

export default connect(mapState, mapDispatch)(UnwrapModal)
