import { RootState } from 'modules/root/types'
import { CastState } from './reducer'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { CREATE_CAST_REQUEST, CREATE_CAST_SUCCESS } from './actions'
import { createSelector } from 'reselect'
import { createPendingTransactionSelector } from 'modules/transaction/selectors'

export const getState: (state: RootState) => CastState = state => state.cast

export const getData: (state: RootState) => CastState['data'] = state => getState(state).data

export const getError: (state: RootState) => CastState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const isCreating = (state: RootState) => isLoadingType(getState(state).loading, CREATE_CAST_REQUEST)

export const getPendingCasts = createSelector(
  createPendingTransactionSelector(CREATE_CAST_SUCCESS),
  (transactions) => transactions.map(tx => tx.payload.voteId).filter(Boolean) as string[]
)
