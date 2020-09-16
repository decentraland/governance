import { Reducer, Store } from 'redux'
import { action } from 'typesafe-actions'
import { RouterState } from 'connected-react-router'
import { TransactionState } from 'decentraland-dapps/dist/modules/transaction/reducer'
import { TranslationState } from 'decentraland-dapps/dist/modules/translation/reducer'
import { StorageState } from 'decentraland-dapps/dist/modules/storage/reducer'
import { ModalState } from 'decentraland-dapps/dist/modules/modal/reducer'
import { STORAGE_LOAD } from 'decentraland-dapps/dist/modules/storage/actions'
import { OrganizationState } from 'modules/organization/reducer'
import { AppState } from 'modules/app/reducer'
import { ProposalState } from 'modules/proposal/reducer'
import { WalletState } from 'modules/wallet/reducer'
import { ProposalDescriptionState } from 'modules/description/reducer'
import { CastState } from 'modules/cast/reducer'
import { SubscriptionState } from 'modules/subscription/reducer'
import { BalanceState } from 'modules/balance/reducer'

export type Vector3 = { x: number; y: number; z: number }

export type Quaternion = { x: number; y: number; z: number; w: number }

const storageLoad = () => action(STORAGE_LOAD, {} as RootState)
export type StorageLoadAction = ReturnType<typeof storageLoad>

export type RootState = {
  transaction: TransactionState
  translation: TranslationState
  storage: StorageState
  wallet: WalletState
  balance: BalanceState
  organization: OrganizationState
  modal: ModalState
  app: AppState
  proposal: ProposalState
  description: ProposalDescriptionState
  cast: CastState
  router: RouterState
  subscription: SubscriptionState
}

export type RootStore = Store<RootState>
export type RootReducer = Reducer<RootState>
