import type { TransactionReceipt } from '@ethersproject/providers'

import { isSameAddress } from '../entities/Snapshot/utils'
import { AlchemyLog } from '../shared/types/events'

import RpcService from './RpcService'

// Snapshot's DelegateRegistry is deployed at the same address on every supported chain.
export const SNAPSHOT_DELEGATION_REGISTRY = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'

// How long after its block a transaction may stay unknown to our RPC node before we stop asking
// Alchemy to retry. Covers node lag behind Alchemy's head; past it, the transaction was reorged out
// (or the webhook watches a different chain than this deployment), and retrying cannot help.
export const RECEIPT_GRACE_PERIOD_MS = 10 * 60 * 1000

// Receipts are fetched a few at a time so a block full of candidate logs cannot burst the RPC.
const RECEIPT_CONCURRENCY = 4

export type DelegationLogCandidate = { txHash: string; log: AlchemyLog }

export type DelegationVerification<T extends DelegationLogCandidate> = {
  verified: T[]
  rejected: { candidate: T; reason: string }[]
  // Transactions whose receipt could not be checked yet: the delivery must be retried for them.
  retryTxHashes: string[]
}

type ReceiptLookup =
  | { status: 'found'; receipt: TransactionReceipt }
  | { status: 'missing' }
  | { status: 'failed'; error: unknown }

/**
 * The Alchemy HMAC proves a payload came from Alchemy, not which contract emitted each log, and the
 * webhook query does not reliably carry the emitter. Any contract can emit a log with the registry's
 * SetDelegate/ClearDelegate topics, so a log is only trusted once the transaction receipt on chain
 * shows the registry emitted that exact log (same index, address, topics and data).
 */
export class DelegationReceiptVerifier {
  static async verify<T extends DelegationLogCandidate>(
    candidates: T[],
    blockTimestamp: number,
    now = Date.now()
  ): Promise<DelegationVerification<T>> {
    const result: DelegationVerification<T> = { verified: [], rejected: [], retryTxHashes: [] }
    if (candidates.length === 0) {
      return result
    }

    const receipts = await this.fetchReceipts(candidates.map((candidate) => candidate.txHash))
    // A NaN timestamp (malformed payload) compares false, so it falls on the drop side, never retry.
    const withinGracePeriod = now - blockTimestamp * 1000 < RECEIPT_GRACE_PERIOD_MS
    const retry = new Set<string>()

    for (const candidate of candidates) {
      const lookup = receipts.get(candidate.txHash.toLowerCase())
      if (!lookup || lookup.status === 'failed') {
        // The RPC errored (network, 5xx, 429): an infrastructure problem, not something the log
        // controls, since the only input sent is an already-validated tx hash. Retry the delivery.
        retry.add(candidate.txHash)
      } else if (lookup.status === 'missing') {
        if (withinGracePeriod) {
          retry.add(candidate.txHash) // most likely our node lags Alchemy by a block or two
        } else {
          result.rejected.push({ candidate, reason: 'transaction unknown to the RPC' })
        }
      } else {
        const reason = this.mismatchReason(candidate.log, lookup.receipt)
        if (reason) {
          result.rejected.push({ candidate, reason })
        } else {
          result.verified.push(candidate)
        }
      }
    }

    result.retryTxHashes = [...retry]
    return result
  }

  private static async fetchReceipts(txHashes: string[]) {
    const unique = [...new Map(txHashes.map((hash) => [hash.toLowerCase(), hash])).entries()]
    const provider = RpcService.getEnvironmentProvider()
    const lookups = new Map<string, ReceiptLookup>()

    for (let i = 0; i < unique.length; i += RECEIPT_CONCURRENCY) {
      const chunk = unique.slice(i, i + RECEIPT_CONCURRENCY)
      // allSettled so one failing lookup does not discard receipts that did come back.
      const results = await Promise.allSettled(chunk.map(([, hash]) => provider.getTransactionReceipt(hash)))
      results.forEach((settled, j) => {
        const key = chunk[j][0]
        if (settled.status === 'rejected') {
          lookups.set(key, { status: 'failed', error: settled.reason })
        } else if (!settled.value) {
          lookups.set(key, { status: 'missing' })
        } else {
          lookups.set(key, { status: 'found', receipt: settled.value })
        }
      })
    }
    return lookups
  }

  private static mismatchReason(log: AlchemyLog, receipt: TransactionReceipt): string | undefined {
    if (receipt.status !== 1) {
      return 'transaction did not succeed'
    }
    // Alchemy's log index is block-wide, the same numbering as a receipt log's logIndex.
    const onChain = receipt.logs.find((receiptLog) => receiptLog.logIndex === log.index)
    if (!onChain) {
      return 'no log at that index in the transaction'
    }
    if (!isSameAddress(onChain.address, SNAPSHOT_DELEGATION_REGISTRY)) {
      return 'log was not emitted by the delegate registry'
    }
    if (!sameHexList(onChain.topics, log.topics)) {
      return 'log topics differ from the receipt'
    }
    if (typeof log.data === 'string' && !sameHex(onChain.data, log.data)) {
      return 'log data differs from the receipt'
    }
    return undefined
  }
}

function sameHex(a: unknown, b: unknown) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase()
}

function sameHexList(a: unknown[], b: unknown[]) {
  return a.length === b.length && a.every((value, i) => sameHex(value, b[i]))
}
