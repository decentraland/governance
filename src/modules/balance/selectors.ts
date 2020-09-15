import { RootState } from 'modules/root/types'
import { BalanceState } from './reducer'

export const getState: (state: RootState) => BalanceState = state => state.balance

export const getData: (state: RootState) => BalanceState['data'] = state => getState(state).data

export const getError: (state: RootState) => BalanceState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading
