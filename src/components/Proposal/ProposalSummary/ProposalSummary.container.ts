import { connect } from 'react-redux'
import { push } from 'connected-react-router'
// import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
// import { isConnected, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { /* getData, */ getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getData as getApps, getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getLoading as getLoadingVotes } from 'modules/vote/selectors'
import { LOAD_VOTES_REQUEST } from 'modules/vote/actions'
import ProposalSummary from './ProposalSummary'
import { MapDispatchProps, MapStateProps, MapDispatch, DefaultProps } from './ProposalSummary.types'

const mapState = (state: RootState, props: DefaultProps): MapStateProps => {
  const address = '' as any // props.vote.appAddress
  const app = props.vote && getApps(state)[address]
  const creator = props.vote && getApps(state)[props.vote.creator]

  return {
    app,
    creator,
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_VOTES_REQUEST)
    )
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onNavigate: (href: string) => dispatch(push(href))
  // onConnect: () => dispatch(connectWalletRequest())
})

export default connect(mapState, mapDispatch)(ProposalSummary)
