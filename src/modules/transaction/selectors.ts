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
        return true
      }

      for (const tx of transactions || []) {
        if (tx.from === address && tx.actionType === actionType && isPending(tx.status)) {
          return true
        }
      }

      return false
    }
  )
}
