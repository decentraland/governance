import { connect } from 'react-redux'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import NewProposalModal from './NewProposalModal'
import { MapDispatchProps, MapStateProps, MapDispatch } from './NewProposalModal.types'
import { locations } from 'routing/locations'
import { NewProposalParams } from 'routing/types'
import { push } from 'connected-react-router'
import { getQuery } from 'routing/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isLoading: (
    getLoadingOrganization(state) ||
    isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
    isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
  ),
  params: getQuery(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onChangeParams: (options: NewProposalParams = {}) => dispatch(push(locations.root(options)))
})

export default connect(mapState, mapDispatch)(NewProposalModal)
