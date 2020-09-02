import { connect } from 'react-redux'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { /* getData, */ getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { /* getData, */ getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import WrappingSummary from './WrappingSummary'
import { MapDispatchProps, MapStateProps, MapDispatch } from './WrappingSummary.types'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isLoading: (
    getLoadingOrganization(state) ||
    isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
    isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
  )
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest())
})

export default connect(mapState, mapDispatch)(WrappingSummary)
