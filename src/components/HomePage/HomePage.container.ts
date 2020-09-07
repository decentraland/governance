import { connect } from 'react-redux'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getVotes, getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import HomePage from './HomePage'
import { MapDispatchProps, MapStateProps, MapDispatch } from './HomePage.types'
import { locations } from 'routing/locations'
import { NewProposalParams } from 'routing/types'
import { push } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => ({
  votes: getVotes(state),
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isLoading: (
    getLoadingOrganization(state) ||
    isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
    isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
  )
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onChangeParams: (options: NewProposalParams = {}) => dispatch(push(locations.root(options)))
})

export default connect(mapState, mapDispatch)(HomePage)
