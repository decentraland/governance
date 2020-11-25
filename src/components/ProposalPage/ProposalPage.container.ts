import { connect } from 'react-redux'
import { isConnected, isConnecting, isEnabling, getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import ProposalPage from './ProposalPage'

import { RootState } from 'modules/root/types'
import { getLoading as getLoadingOrganization } from 'modules/organization/selectors'
import { getLoading as getLoadingApps } from 'modules/app/selectors'
import { LOAD_APPS_REQUEST } from 'modules/app/actions'
import { getData as getProposals, getExecutedTransactions, getLoading as getLoadingVotes, isExecuting } from 'modules/proposal/selectors'
import { getData as getProposalDescriptions } from 'modules/description/selectors'
import { getData as getCasts, getPendingCasts } from 'modules/cast/selectors'
import { getData as getWallet } from 'modules/wallet/selectors'
import { getData as getBalance } from 'modules/balance/selectors'
import { executeScriptRequest, executeVoteRequest, LOAD_PROPOSALS_REQUEST } from 'modules/proposal/actions'
import { MapDispatchProps, MapStateProps, MapDispatch } from './ProposalPage.types'
import { loadCastsRequest } from 'modules/cast/actions'
import { loadBalanceRequest } from 'modules/balance/actions'
import { push, goBack, replace } from 'connected-react-router'
import { AggregatedVote } from 'modules/proposal/types'
import { getProposalId } from 'modules/proposal/utils'
import { Cast } from '@aragon/connect-voting'
import { locations } from 'routing/locations'

const mapState = (state: RootState, props: any): MapStateProps => {
  const address = (getAddress(state) || '').toLowerCase()
  const canGoBack = props?.history?.length > 1

  const { app, id } = props?.match?.params || {}
  const proposalId = getProposalId(app, id)
  const proposal = getProposals(state)[proposalId] as AggregatedVote
  const balance = getBalance(state)[proposalId]
  const casts = getCasts(state)[proposalId]
  const executedTransactions = getExecutedTransactions(state)
  let cast: Cast | undefined = undefined

  if (Boolean(address) && Array.isArray(casts)) {
    for (const currentCast of casts) {
      if (currentCast.voter.address.toLowerCase() === address) {
        if (!cast || cast.vote < currentCast.vote) {
          cast = currentCast
        }
      }
    }
  }

  return ({
    proposal,
    casts,
    cast,
    balance,
    wallet: getWallet(state),
    description: getProposalDescriptions(state)[proposalId],
    executed: proposal?.script === '0x' || executedTransactions.some(tx => tx.payload.scriptId === proposalId),
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isEnabling: isEnabling(state),
    isExecuting: isExecuting(state),
    isPending: getPendingCasts(state).includes(proposalId),
    canGoBack,
    isLoading: (
      getLoadingOrganization(state) ||
      isLoadingType(getLoadingApps(state), LOAD_APPS_REQUEST) ||
      isLoadingType(getLoadingVotes(state), LOAD_PROPOSALS_REQUEST)
    )
  })
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onNavigate: (href: string, r: boolean = false) => dispatch(r ? replace(href) : push(href)),
  onBack: () => dispatch(goBack()),
  onHome: () => dispatch(push(locations.root())),
  onRequireCasts : (votes: string[]) => dispatch(loadCastsRequest(votes)),
  onRequireBalance : (votes: string[]) => dispatch(loadBalanceRequest(votes)),
  onExecuteVote: (id: string) => dispatch(executeVoteRequest(id)),
  onExecuteScript: (id: string) => dispatch(executeScriptRequest(id))
})

export default connect(mapState, mapDispatch)(ProposalPage)
