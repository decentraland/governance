import { createStore, compose, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import createSagasMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import { createBrowserHistory } from 'history'

import { env } from 'decentraland-commons'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'
import { storageReducerWrapper } from 'decentraland-dapps/dist/modules/storage/reducer'
import { createAnalyticsMiddleware } from 'decentraland-dapps/dist/modules/analytics/middleware'
import { createTransactionMiddleware } from 'decentraland-dapps/dist/modules/transaction/middleware'
import { CONNECT_WALLET_SUCCESS } from 'decentraland-dapps/dist/modules/wallet/actions'
import { CLEAR_TRANSACTIONS } from 'decentraland-dapps/dist/modules/transaction/actions'
import { configure as configureAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import { createRootReducer } from './reducer'
import { rootSaga } from './sagas'
import { LOAD_PROPOSAL_DESCRIPTION_SUCCESS } from 'modules/description/actions'
import { ProposalStatus } from 'modules/proposal/types'
import { LOAD_PROPOSALS_SUCCESS } from 'modules/proposal/actions'

const version = require('../../../package.json').version

configureAnalytics({
  transformPayload: payload => {
    if (typeof payload === 'string' || payload === undefined) return payload
    return { ...payload, version }
  }
})

// @ts-ignore: Dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const history = createBrowserHistory()
const rootReducer = storageReducerWrapper(createRootReducer(history))

const sagasMiddleware = createSagasMiddleware()
const loggerMiddleware = createLogger({
  predicate: () => env.isDevelopment(),
  collapsed: () => true
})

const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware({
  storageKey: 'governance', // this is the key used to save the state in localStorage (required)
  paths: [
    ['balance', 'data'],
    ['description', 'data'],
    // ['vote', 'persist'],
    ['transaction']
  ], // array of paths from state to be persisted (optional)
  actions: [
    CLEAR_TRANSACTIONS,
    CONNECT_WALLET_SUCCESS,
    LOAD_PROPOSALS_SUCCESS,
    LOAD_PROPOSAL_DESCRIPTION_SUCCESS
  ], // array of actions types that will trigger a SAVE (optional)
  transform: (state: any) => {
    const votePersist = Object.entries<any>(state?.vote?.data || {})
      .filter(([_key, value]) => {
        return (
          value && (
            value.status === ProposalStatus.Enacted ||
            value.status === ProposalStatus.Passed ||
            value.status === ProposalStatus.Rejected
          )
        )
      })
      .map(([key, value]) => {
        return [key, { ...value }]
      })

    return {
      ...state,
      vote: {
        ...state.vote,
        persist: Object.fromEntries(votePersist)
      }
    }
  }
})

const analyticsMiddleware = createAnalyticsMiddleware(env.get('REACT_APP_SEGMENT_KEY'))
const transactionMiddleware = createTransactionMiddleware()
const enhancer = composeEnhancers(applyMiddleware(
  sagasMiddleware,
  routerMiddleware(history),
  loggerMiddleware,
  transactionMiddleware,
  storageMiddleware,
  analyticsMiddleware
))
const store = createStore(rootReducer, { }, enhancer)

sagasMiddleware.run(rootSaga)
loadStorageMiddleware(store)

export function getState() {
  return store.getState()
}

export { store, history }
