import { RootState } from 'modules/root/types'
import { createSelector } from 'reselect'
import { VoteState } from './reducer'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { CREATE_POI_REQUEST, CREATE_QUESTION_REQUEST, CREATE_BAN_REQUEST, CREATE_CATALYST_REQUEST } from './actions'
import { sortVotes } from './utils'

export const getState: (state: RootState) => VoteState = state => state.vote

export const getData: (state: RootState) => VoteState['data'] = state => getState(state).data

export const getError: (state: RootState) => VoteState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getVotes = createSelector(getData, (data) => Array.from(Object.values(data)).sort(sortVotes))

export const isCreatingPoi = (state: RootState) => isLoadingType(getState(state).loading, CREATE_POI_REQUEST)
export const isCreatingQuestion = (state: RootState) => isLoadingType(getState(state).loading, CREATE_QUESTION_REQUEST)
export const isCreatingBan = (state: RootState) => isLoadingType(getState(state).loading, CREATE_BAN_REQUEST)
export const isCreatingCatalyst = (state: RootState) => isLoadingType(getState(state).loading, CREATE_CATALYST_REQUEST)
export const isCreating = (state: RootState) => isCreatingPoi(state) || isCreatingQuestion(state) || isCreatingBan(state) || isCreatingCatalyst(state)
