import { RootState } from 'modules/root/types'
import { OrganizationState } from './reducer'

export const getState: (state: RootState) => OrganizationState = state => state.organization

export const getOrganization: (state: RootState) => OrganizationState['data'] = state => getState(state).data

export const getError: (state: RootState) => OrganizationState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading
