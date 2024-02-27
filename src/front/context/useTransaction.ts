import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { getTransaction } from 'decentraland-dapps/dist/modules/transaction/txUtils'
import { AnyTransaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'

import Time from '../../utils/date/Time'

import { PersistedKeys } from './auth/storage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-constraint
type Transaction<P extends unknown = any> = AnyTransaction & {
  timestamp: number
  chainId: ChainId | string
  payload: P
}

const transactions = new Map<string, Transaction[]>()

function getKey(address: string, chainId: ChainId) {
  return [PersistedKeys.Transactions, address, chainId].join('.')
}

function injectTransaction(transaction: Transaction, transactions: Transaction[] = []): Transaction[] {
  if (transactions.length === 0) {
    return [transaction]
  }

  let replaced = false
  const formattedTransactions = transactions.map((tx) => {
    if (tx.hash === transaction.hash) {
      replaced = true
      return {
        ...transaction,
        chainId: typeof transaction.chainId === 'string' ? parseInt(transaction.chainId, 16) : transaction.chainId,
      }
    }

    return tx
  })

  return replaced ? formattedTransactions : [transaction, ...formattedTransactions]
}

export function storeTransactions(address: string, chainId: ChainId, txs: Transaction[]) {
  const key = getKey(address, chainId)
  let memoryTransactions: Transaction[] = transactions.get(key) || []
  let storageTransactions: Transaction[] = JSON.parse(localStorage.getItem(key) || '[]')

  for (const tx of txs) {
    memoryTransactions = injectTransaction(tx, memoryTransactions)
    storageTransactions = injectTransaction(tx, storageTransactions)
  }

  const filteredMemoryTransasctions = memoryTransactions.filter((tx) => tx.chainId === chainId)
  if (memoryTransactions.length !== filteredMemoryTransasctions.length) {
    memoryTransactions = filteredMemoryTransasctions
  }

  transactions.set(key, memoryTransactions)
  localStorage.setItem(key, JSON.stringify(storageTransactions))

  return memoryTransactions
}

export function restoreTransactions(address: string, chainId: ChainId): Transaction[] {
  const key = getKey(address, chainId)
  if (!transactions.has(key)) {
    const storedTransactions = JSON.parse(localStorage.getItem(key) || '[]') as Transaction[]
    transactions.set(key, storedTransactions)
  }

  return transactions.get(key)!.filter((tx) => tx.chainId === chainId)
}

export function clearTransactions(address: string, chainId: ChainId): void {
  const key = getKey(address, chainId)
  transactions.delete(key)
  localStorage.removeItem(key)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionState = Transaction<any>[]

const initialState: TransactionState = []

export default function useTransaction(address?: string | null, chainId?: ChainId | null) {
  const [transactions, setTransactions] = useState<TransactionState>(initialState)

  // re-store tranasctions
  useEffect(() => {
    if (address && chainId) {
      setTransactions(restoreTransactions(address, chainId))
    }
  }, [address, chainId])

  // track transactions
  useEffect(() => {
    let closed = false
    let timer: number | null = null

    async function updateTransactions() {
      if (!address || !chainId) {
        return
      }

      let txs = transactions || []
      const updatedTransactions: Transaction[] = []
      for (const tx of txs) {
        if (isPending(tx.status)) {
          const updatedTransaction = await getTransaction(address, tx.chainId as ChainId, tx.hash)

          if (updatedTransaction) {
            const typedUpdatedTransactions = updatedTransaction as unknown as Record<string, string>
            const hasChanges = Object.keys(typedUpdatedTransactions).some((key: string) => {
              const typedTx = tx as unknown as Record<string, string>
              return (
                typedTx[key] !== typedUpdatedTransactions[key] &&
                String(typedTx[key]) !== String(typedUpdatedTransactions[key])
              )
            })

            if (hasChanges) {
              updatedTransactions.push({
                ...tx,
                ...updatedTransaction,
              })
            }
          }
        }
      }

      if (updatedTransactions.length > 0 && !closed) {
        txs = storeTransactions(address, chainId, updatedTransactions)
        setTransactions(txs)
      }

      const pendingTransactions = txs.filter((tx) => isPending(tx.status))
      if (pendingTransactions.length > 0 && !closed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timer = setTimeout(updateTransactions, Time.Second * 2) as any
      }
    }

    updateTransactions()

    return () => {
      closed = true
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [transactions])

  const add = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hash: string, payload: Record<string, any> = {}) => {
      if (address && chainId) {
        getTransaction(address, chainId, hash)
          .then((tx) => {
            if (!tx) {
              return
            }

            const newTransaction: Transaction = {
              ...tx,
              timestamp: Date.now(),
              chainId,
              payload,
            }

            const txs = storeTransactions(address, chainId, [newTransaction])
            setTransactions(txs)
          })
          .catch((err) => {
            console.error(err)
            // TODO: Report to Rollbar
            // TODO: Report to segment
            // segment((analytics) =>
            //   analytics.track('error', {
            //     ...err,
            //     message: err.message,
            //     stack: err.stack,
            //   })
            // )
          })
      }
    },
    [transactions]
  )

  const clear = useCallback(() => {
    if (!address || !chainId) {
      return
    }

    setTransactions(initialState)
    clearTransactions(address, chainId)
  }, [transactions])

  const actions = useMemo(() => ({ add, clear }), [add, clear])

  return [transactions, actions] as const
}
