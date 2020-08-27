import { RootState } from 'modules/root/types'
import { createSelector } from 'reselect'
import { VoteState } from './reducer'

export const getState: (state: RootState) => VoteState = state => state.vote

export const getData: (state: RootState) => VoteState['data'] = state => getState(state).data

export const getError: (state: RootState) => VoteState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getVotes = createSelector(getData, (data) => Array.from(Object.values(data)).sort((voteA, voteB) => voteB.startDate.localeCompare(voteA.startDate)))
