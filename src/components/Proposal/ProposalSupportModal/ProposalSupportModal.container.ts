import { connect } from 'react-redux'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/root/types'
import ProposalSupportModal from './ProposalSupportModal'
import { MapDispatchProps, MapStateProps, MapDispatch } from './ProposalSupportModal.types'
import { push, replace } from 'connected-react-router'
import { getCastParams } from 'routing/selectors'
import { createCastRequest } from 'modules/cast/actions'
import { isCreating } from 'modules/cast/selectors'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { ProviderType } from 'decentraland-connect/dist/types'

const mapState = (state: RootState): MapStateProps => {
  return {
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isEnabling: isEnabling(state),
    isCreating: isCreating(state),
    params: getCastParams(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string, r: boolean = false) => dispatch(r ? replace(href) : push(href)),
  onCreateCast: (voteId: string, support: boolean = true) => dispatch(createCastRequest(voteId, support)),
  onConnect: (providerType: ProviderType) => dispatch(enableWalletRequest(providerType))
})

export default connect(mapState, mapDispatch)(ProposalSupportModal)
