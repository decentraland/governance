import { connect } from 'react-redux'
import { enableWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getLoading as getLoadingVotes, isCreating } from 'modules/proposal/selectors'
import { LOAD_PROPOSALS_REQUEST, createBanRequest, createQuestionRequest, createPoiRequest, createCatalystRequest } from 'modules/proposal/actions'
import NewProposalModal from './NewProposalModal'
import { MapDispatchProps, MapStateProps, MapDispatch } from './NewProposalModal.types'
import { push, replace } from 'connected-react-router'
import { getFilterProposalParams, getNewProposalParams } from 'routing/selectors'
import { getData } from 'modules/wallet/selectors'

const mapState = (state: RootState): MapStateProps => ({
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  isCreating: isCreating(state),
  isEnabling: isEnabling(state),
  isLoading: (
    getLoadingOrganization(state) ||
    isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
    isLoadingType(getLoadingVotes(state), LOAD_PROPOSALS_REQUEST)
  ),
  wallet: getData(state),
  params: {
    ...getFilterProposalParams(state),
    ...getNewProposalParams(state)
  }
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest()),
  onNavigate: (href: string, r: boolean = false) => dispatch(r ? replace(href) : push(href)),
  onCreateQuestion: (question: string) => dispatch(createQuestionRequest(question)),
  onCreateBan: (name: string) => dispatch(createBanRequest(name)),
  onCreatePoi: (x: number, y: number) => dispatch(createPoiRequest(x, y)),
  onCreateCatalyst: (owner: string, url: string) => dispatch(createCatalystRequest(owner, url))
})

export default connect(mapState, mapDispatch)(NewProposalModal)
