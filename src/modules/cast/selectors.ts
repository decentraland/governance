import { RootState } from 'modules/root/types'
import { CastState } from './reducer'

export const getState: (state: RootState) => CastState = state => state.cast

export const getData: (state: RootState) => CastState['data'] = state => getState(state).data

export const getError: (state: RootState) => CastState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading
