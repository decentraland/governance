import { createSelector } from 'reselect'
import { getData as getTransactions } from 'decentraland-dapps/dist/modules/transaction/selectors'
import { hasSucceeded, isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { getAddress, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Transaction } from 'decentraland-dapps/dist/modules/transaction/types'

export function createTransactionSelector(filter: (tx: Transaction) => boolean) {
  return createSelector(
    isConnecting,
    getAddress,
    getTransactions,
    (connecting, address, transactions) => {
      if (connecting) {
        return []
      }

      return (transactions || []).filter(tx => tx.from === address && filter(tx))
    }
  )
}

export function createCompletedTransactionSelector(actionType: string) {
  return createTransactionSelector((tx) => tx.actionType === actionType && hasSucceeded(tx.status))
}

export function createPendingTransactionSelector(actionType: string) {
  return createTransactionSelector((tx) => tx.actionType === actionType && isPending(tx.status))
}

export function createIsPendingTransactionSelector(actionType: string) {
  return createSelector(
    createPendingTransactionSelector(actionType),
    (transactions) => transactions.length > 0
  )
}
