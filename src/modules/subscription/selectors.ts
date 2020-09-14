import { RootState } from 'modules/root/types'
import { SubscriptionState } from './reducer'

export const getState: (state: RootState) => SubscriptionState = state => state.subscription

export const getData: (state: RootState) => SubscriptionState['data'] = state => getState(state).data

export const getError: (state: RootState) => SubscriptionState['error'] = state => getState(state).error
