import { connect } from 'react-redux'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import ProposalPage from './ProposalPage'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getData as getVotes, getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { getData as getVoteDescription } from 'modules/description/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import { MapDispatchProps, MapStateProps, MapDispatch } from './ProposalPage.types'

const mapState = (state: RootState, props: any): MapStateProps => {
  const { app, id } = props?.match?.params || {}
  const voteId = `appAddress:${app}-voteId:0x${Number(id).toString(16)}`
  return ({
    vote: getVotes(state)[voteId],
    description: getVoteDescription(state)[voteId],
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isEnabling: isEnabling(state),
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
    )
  })
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect(mapState, mapDispatch)(ProposalPage)
