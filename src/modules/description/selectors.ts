import { RootState } from 'modules/root/types'
import { VoteDescriptionState } from './reducer'

export const getState: (state: RootState) => VoteDescriptionState = state => state.description

export const getData: (state: RootState) => VoteDescriptionState['data'] = state => getState(state).data

export const getError: (state: RootState) => VoteDescriptionState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading
