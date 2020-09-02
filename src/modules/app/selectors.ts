import { Voting } from '@aragon/connect-thegraph-voting'
import { RootState } from 'modules/root/types'
import { createSelector } from 'reselect'
import { AppState } from './reducer'
import { VOTING_APP, VOTING_GRAPH } from './types'
import { getNetwork } from 'modules/wallet/selectors'

export const getState: (state: RootState) => AppState = state => state.app

export const getData: (state: RootState) => AppState['data'] = state => getState(state).data

export const getError: (state: RootState) => AppState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getVotingApps = createSelector(
  getNetwork,
  getData,
  (network, apps) => Array.from(Object.values(apps)).filter(app => app.appName === VOTING_APP[network])
)

export const getVoting = createSelector(
  getNetwork,
  getVotingApps,
  (network, apps) => apps.map(app => new Voting(app.address, VOTING_GRAPH[network]))
)
