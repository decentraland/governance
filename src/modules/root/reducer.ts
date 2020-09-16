import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { translationReducer as translation } from 'decentraland-dapps/dist/modules/translation/reducer'
import { transactionReducer as transaction } from 'decentraland-dapps/dist/modules/transaction/reducer'
import { storageReducer as storage, storageReducerWrapper } from 'decentraland-dapps/dist/modules/storage/reducer'
import { modalReducer as modal } from 'decentraland-dapps/dist/modules/modal/reducer'

import { RootState } from 'modules/root/types'
import { appReducer as app } from 'modules/app/reducer'
import { organizationReducer as organization } from 'modules/organization/reducer'
import { walletReducer as wallet } from 'modules/wallet/reducer'
import { proposalReducer as proposal } from 'modules/proposal/reducer'
import { proposalDescriptionReducer as description } from 'modules/description/reducer'
import { castsReducer as cast } from 'modules/cast/reducer'
import { subscriptionReducer as subscription } from 'modules/subscription/reducer'
import { balanceReducer as balance } from 'modules/balance/reducer'

export function createRootReducer(history: History) {
  return storageReducerWrapper(
    combineReducers<RootState>({
      storage,
      transaction,
      translation,
      wallet,
      organization,
      app,
      proposal,
      description,
      cast,
      modal,
      subscription,
      balance,
      router: connectRouter(history)
    })
  )
}
