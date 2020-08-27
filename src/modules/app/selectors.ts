import { Voting } from '@aragon/connect-thegraph-voting'
import { RootState } from 'modules/root/types'
import { createSelector } from 'reselect'
import { AppState } from './reducer'
import { env } from 'decentraland-commons'

const VOTING_APP_NAME = env.get('REACT_APP_VOTING_APP_NAME', '')
const VOTING_GRAPH = env.get('REACT_APP_VOTING_GRAPH', '')

export const getState: (state: RootState) => AppState = state => state.app

export const getData: (state: RootState) => AppState['data'] = state => getState(state).data

export const getError: (state: RootState) => AppState['error'] = state => getState(state).error

export const getLoading = (state: RootState) => getState(state).loading

export const getVotingApps = createSelector(getData, (apps) => Array.from(Object.values(apps)).filter(app => app.appName === VOTING_APP_NAME))

export const getVoting = createSelector(getVotingApps, (apps) => apps.map(app => new Voting(app.address, VOTING_GRAPH)))
