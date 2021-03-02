import { connect } from 'react-redux'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getProposals, getLoading as getLoadingVotes } from 'modules/proposal/selectors'
import { LOAD_PROPOSALS_REQUEST } from 'modules/proposal/actions'
import HomePage from './HomePage'
import { MapDispatchProps, MapStateProps, MapDispatch } from './HomePage.types'
import { locations } from 'routing/locations'
import { NewProposalParams, FilterProposalParams, SignInParams } from 'routing/types'
import { getNewProposalParams, getFilterProposalParams } from 'routing/selectors'
import { push } from 'connected-react-router'
import { ProviderType } from 'decentraland-dapps/dist/modules/wallet/types'

const mapState = (state: RootState): MapStateProps => {
  return {
    proposals: getProposals(state),
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    params: {
      ...getFilterProposalParams(state),
      ...getNewProposalParams(state)
    },
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_PROPOSALS_REQUEST)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: (providerType: ProviderType) => dispatch(enableWalletRequest(providerType)),
  onChangeParams: (options: NewProposalParams | FilterProposalParams | SignInParams = {}) => dispatch(push(locations.proposals(options)))
})

export default connect(mapState, mapDispatch)(HomePage)
