import { RootState } from 'modules/root/types'
import { ProposalEmbedState } from './reducer'

export const getState: (state: RootState) => ProposalEmbedState = state => state.embed

export const getData: (state: RootState) => ProposalEmbedState['data'] = state => getState(state).data

export const getError: (state: RootState) => ProposalEmbedState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading
