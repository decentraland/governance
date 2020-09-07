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
import { voteReducer as vote } from 'modules/vote/reducer'

export function createRootReducer(history: History) {
  return storageReducerWrapper(
    combineReducers<RootState>({
      storage,
      transaction,
      translation,
      wallet,
      organization,
      app,
      vote,
      modal,
      router: connectRouter(history)
    })
  )
}
