import { RootState } from 'modules/root/types'
import { getData as getDescriptions } from 'modules/description/selectors'
import { createSelector } from 'reselect'
import { ProposalState } from './reducer'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import {
  CREATE_POI_REQUEST,
  CREATE_QUESTION_REQUEST,
  CREATE_BAN_REQUEST,
  CREATE_CATALYST_REQUEST,
  EXECUTE_SCRIPT_SUCCESS,
  EXECUTE_SCRIPT_REQUEST,
  EXECUTE_VOTE_SUCCESS,
  EXECUTE_VOTE_REQUEST
} from './actions'
import { filterProposals } from './utils'
import { getNetwork } from 'modules/wallet/selectors'
import { createCompletedTransactionSelector, createPendingTransactionSelector } from 'modules/transaction/selectors'
import { getFilterProposalParams } from 'routing/selectors'

export const getState: (state: RootState) => ProposalState = state => state.proposal

export const getData: (state: RootState) => ProposalState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProposalState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getProposals = createSelector(
  getData,
  getDescriptions,
  getFilterProposalParams,
  getNetwork,
  filterProposals
)

export const isCreatingPoi = (state: RootState) => isLoadingType(getState(state).loading, CREATE_POI_REQUEST)
export const isCreatingQuestion = (state: RootState) => isLoadingType(getState(state).loading, CREATE_QUESTION_REQUEST)
export const isCreatingBan = (state: RootState) => isLoadingType(getState(state).loading, CREATE_BAN_REQUEST)
export const isCreatingCatalyst = (state: RootState) => isLoadingType(getState(state).loading, CREATE_CATALYST_REQUEST)
export const isCreating = (state: RootState) => isCreatingPoi(state) || isCreatingQuestion(state) || isCreatingBan(state) || isCreatingCatalyst(state)

export const isExecuting = createSelector(
  createPendingTransactionSelector(EXECUTE_VOTE_SUCCESS),
  createPendingTransactionSelector(EXECUTE_SCRIPT_SUCCESS),
  getLoading,
  (executingVoteTransactions, executingScriptTransactions, loading) => (
    executingVoteTransactions.length > 0 ||
    executingScriptTransactions.length > 0 ||
    isLoadingType(loading, EXECUTE_VOTE_REQUEST) ||
    isLoadingType(loading, EXECUTE_SCRIPT_REQUEST)
  )
)

export const getExecutedTransactions = createCompletedTransactionSelector(EXECUTE_SCRIPT_SUCCESS)
