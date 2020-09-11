import { connect } from 'react-redux'
import { isConnected, isConnecting, isEnabling, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import ProposalPage from './ProposalPage'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getData as getVotes, getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { getData as getVoteDescription } from 'modules/description/selectors'
import { getData as getCasts, getPendingCasts } from 'modules/cast/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import { MapDispatchProps, MapStateProps, MapDispatch } from './ProposalPage.types'
import { loadCastsRequest } from 'modules/cast/actions'
import { push } from 'connected-react-router'

const mapState = (state: RootState, props: any): MapStateProps => {
  const address = (getAddress(state) || '').toLowerCase()

  const { app, id } = props?.match?.params || {}
  const voteId = `appAddress:${app}-voteId:0x${Number(id).toString(16)}`
  const vote = getVotes(state)[voteId]
  const casts = getCasts(state)[voteId]
  const cast = !!address && Array.isArray(casts) ? casts.find((cast) => cast.voter === address) : undefined

  return ({
    vote,
    casts,
    cast,
    description: getVoteDescription(state)[voteId],
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isEnabling: isEnabling(state),
    isPending: getPendingCasts(state).includes(voteId),
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
    )
  })
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onNavigate: (href: string) => dispatch(push(href)),
  onRequireCasts : (votes: string[]) => dispatch(loadCastsRequest(votes))
})

export default connect(mapState, mapDispatch)(ProposalPage)
