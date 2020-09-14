import { connect } from 'react-redux'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import ProposalSupportModal from './ProposalSupportModal'
import { MapDispatchProps, MapStateProps, MapDispatch } from './ProposalSupportModal.types'
import { push } from 'connected-react-router'
import { getCastParams } from 'routing/selectors'
import { createCastRequest } from 'modules/cast/actions'
import { isCreating } from 'modules/cast/selectors'

const mapState = (state: RootState): MapStateProps => {
  return {
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isCreating: isCreating(state),
    params: getCastParams(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string) => dispatch(push(href)),
  onCreateCast: (voteId: string, support: boolean = true) => dispatch(createCastRequest(voteId, support))
})

export default connect(mapState, mapDispatch)(ProposalSupportModal)
