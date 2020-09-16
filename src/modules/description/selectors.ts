import { RootState } from 'modules/root/types'
import { ProposalDescriptionState } from './reducer'

export const getState: (state: RootState) => ProposalDescriptionState = state => state.description

export const getData: (state: RootState) => ProposalDescriptionState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProposalDescriptionState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading
