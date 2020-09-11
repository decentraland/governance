import { createSelector } from 'reselect'
import { getData as getTransactions } from 'decentraland-dapps/dist/modules/transaction/selectors'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { getAddress, isConnecting } from 'decentraland-dapps/dist/modules/wallet/selectors'

export function createPendingTransactionSelector(actionType: string) {
  return createSelector(
    isConnecting,
    getAddress,
    getTransactions,
    (connecting, address, transactions) => {
      if (connecting) {
        return []
      }

      return (transactions || []).filter(tx => tx.from === address && tx.actionType === actionType && isPending(tx.status))
    }
  )
}

export function createIsPendingTransactionSelector(actionType: string) {
  return createSelector(
    createPendingTransactionSelector(actionType),
    (transactions) => transactions.length > 0
  )
}
