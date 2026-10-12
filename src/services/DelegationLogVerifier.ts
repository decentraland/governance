import type { Log } from '@ethersproject/providers'

import { isSameAddress } from '../entities/Snapshot/utils'
import { AlchemyBlock, AlchemyLog } from '../shared/types/events'

import RpcService from './RpcService'

// Snapshot's DelegateRegistry is deployed at the same address on every supported chain.
export const SNAPSHOT_DELEGATION_REGISTRY = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'
export const CLEAR_DELEGATE_SIGNATURE_HASH = '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064'
export const SET_DELEGATE_SIGNATURE_HASH = '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e'

// How long after its block a delivery may keep asking Alchemy to retry it, when the chain cannot be
// read or (without a block hash) our node's block at that height does not match the delivery. Past
// it, the logs are dropped and reported with enough detail to backfill by hand, so a late or
// replayed delivery is never retried forever.
// It is measured from the block timestamp, while Alchemy's own retry window (10 minutes on
// Free/PAYG, 1 hour on Enterprise) starts at the first delivery attempt. A delivery that first
// arrives late (a backlog, or a webhook resumed after a pause) therefore gets fewer retries than
// Alchemy would allow, and none at all if it arrives more than an hour after its block.
export const VERIFICATION_GRACE_PERIOD_MS = 60 * 60 * 1000

const NO_REGISTRY_LOG = 'no delegate registry log at that transaction and index'

// A 32-byte hex value, the shape of both transaction and block hashes.
const HASH_REGEX = /^0x[0-9a-fA-F]{64}$/

export function isHash(value: unknown): value is string {
  return typeof value === 'string' && HASH_REGEX.test(value)
}

export type DelegationLogCandidate = { txHash: string; logIndex: number; log: AlchemyLog }

// The registry logs of the block that was checked. `transactions` (the block's transaction hashes)
// is only known when the block was looked up by number.
type ChainBlock = { blockHash: string; logs: Log[]; transactions?: Set<string> }

export type DelegationVerification<T extends DelegationLogCandidate> =
  // The chain could not be read for this block, so nothing was settled and the whole delivery must
  // be retried. `reason` is a short, URL-free description of the failure.
  | { status: 'unavailable'; reason: string }
  // Every candidate was settled: each one is in exactly one of the two lists.
  | { status: 'checked'; verified: T[]; rejected: { candidate: T; reason: string }[] }

/**
 * The Alchemy HMAC proves a payload came from Alchemy, not which contract emitted each log, and the
 * webhook query does not reliably carry the emitter. Any contract can emit a log with the registry's
 * SetDelegate/ClearDelegate topics, so a log is only trusted once the chain shows the registry
 * emitted that exact log (same transaction, index, topics and data) in the delivered block.
 *
 * The chain is read with ONE eth_getLogs per delivery, filtered to the registry's address (plus one
 * eth_getBlockByNumber when the payload has no block hash). Forged logs are never even returned by
 * the node, and the RPC cost does not grow with how many forged logs an attacker packs into a block.
 */
export class DelegationLogVerifier {
  static async verify<T extends DelegationLogCandidate>(
    candidates: T[],
    block: Pick<AlchemyBlock, 'hash' | 'number' | 'timestamp'>,
    now = Date.now()
  ): Promise<DelegationVerification<T>> {
    if (candidates.length === 0) {
      return { status: 'checked', verified: [], rejected: [] }
    }

    if (!isHash(block.hash) && !isBlockNumber(block.number)) {
      // Nothing to look the logs up by, and a retry carries the same payload: fail closed.
      return {
        status: 'checked',
        verified: [],
        rejected: candidates.map((candidate) => ({ candidate, reason: 'delivery names no block' })),
      }
    }

    // A NaN timestamp compares false, so a malformed payload falls on the drop side and can never be
    // retried forever.
    const withinGracePeriod = now - block.timestamp * 1000 < VERIFICATION_GRACE_PERIOD_MS

    let chain: ChainBlock
    try {
      chain = await this.fetchRegistryLogs(block)
    } catch (error) {
      // Any failure (network, 5xx, 429, timeout, a block our node does not know yet or no longer
      // knows after a reorg, or a block at that height that is not the delivered one) says nothing
      // about the logs themselves.
      const failure = describeRpcError(error)
      if (withinGracePeriod) {
        return { status: 'unavailable', reason: failure }
      }
      const reason =
        error instanceof NotTheDeliveredBlock ? failure : `could not read the block from the RPC: ${failure}`
      return { status: 'checked', verified: [], rejected: candidates.map((candidate) => ({ candidate, reason })) }
    }

    const verified: T[] = []
    const rejected: { candidate: T; reason: string }[] = []
    const notInNodeBlock: T[] = []
    for (const candidate of candidates) {
      const reason = this.mismatchReason(candidate, chain.logs)
      if (!reason) {
        verified.push(candidate)
      } else if (reason === NO_REGISTRY_LOG && chain.transactions && !chain.transactions.has(lower(candidate.txHash))) {
        notInNodeBlock.push(candidate)
      } else {
        rejected.push({ candidate, reason })
      }
    }

    if (notInNodeBlock.length > 0) {
      // Only reachable on the block-number fallback (see fetchRegistryLogs), and only once the node's
      // block has the delivered timestamp, so this is a second line of defence: Alchemy says these
      // transactions are in block N, and our node's block N does not hold them, so it is not the
      // delivered block after all and its silence proves nothing yet. Forged logs cannot use it to
      // force retries: Alchemy only delivers transactions of the block, so a forged log's transaction
      // is in the delivered block like any other, the node's copy of that block holds it, and the
      // forgery is rejected at once.
      if (withinGracePeriod) {
        return {
          status: 'unavailable',
          reason: `the node's block ${block.number} (${chain.blockHash}) does not include ${notInNodeBlock.length} delivered transaction(s)`,
        }
      }
      const reason = `transaction is not in the node's block at that height (${chain.blockHash})`
      rejected.push(...notInNodeBlock.map((candidate) => ({ candidate, reason })))
    }

    return { status: 'checked', verified, rejected }
  }

  private static async fetchRegistryLogs(
    block: Pick<AlchemyBlock, 'hash' | 'number' | 'timestamp'>
  ): Promise<ChainBlock> {
    const provider = RpcService.getEnvironmentProvider()
    let blockHash = block.hash
    let transactions: Set<string> | undefined
    if (!isHash(blockHash)) {
      // Fallback for a webhook query that does not request the block hash: whatever block our node
      // holds at that height, which may not be the block Alchemy delivered (our node, or one upstream
      // behind a load balancer, may still be on an orphaned fork). Checking the wrong block would
      // drop a genuine log for good, and the delivered transaction being in it is no proof that it is
      // the right one: competing blocks at one height are built from the same mempool and usually
      // share most transactions, with the logs at other block-wide indexes. So the block must first
      // be shown to be the delivered one:
      // - Its timestamp must match the delivery's. Under proof of stake, competing blocks at one
      //   height come from different slots and so have different timestamps; two blocks of one slot
      //   need the proposer to equivocate, which is slashable. Otherwise it is not the delivered
      //   block, and the delivery is retried within the grace period (see verify).
      // - Its transaction hashes are kept, so a candidate whose transaction is not in it is retried
      //   too rather than rejected (see verify), in case the timestamps matched anyway.
      //
      // Both come in the same eth_getBlockByNumber response as the block hash that eth_getLogs is
      // pinned to, so they describe one block, and this costs no extra RPC call. Fetching each
      // unmatched transaction's receipt instead would cost one call per forged transaction (an
      // attacker could pack a block with them, so it would need a cap and a policy for what lies past
      // it), could be answered by a different upstream than the one that served the block, and would
      // still name the node's block, so it cannot tell a sibling block that shares the transaction.
      const nodeBlock = await provider.getBlock(block.number)
      if (!nodeBlock) {
        throw new Error(`block ${block.number} not found`)
      }
      // A payload without a numeric timestamp is past the grace period anyway (NaN, see verify), so
      // its logs are only checked against the transaction hashes.
      const deliveredTimestamp = Number(block.timestamp)
      if (Number.isFinite(deliveredTimestamp) && nodeBlock.timestamp !== deliveredTimestamp) {
        throw new NotTheDeliveredBlock(
          `the node's block ${block.number} (${nodeBlock.hash}) has timestamp ${nodeBlock.timestamp}, not the delivered ${deliveredTimestamp}`
        )
      }
      blockHash = nodeBlock.hash
      transactions = new Set(nodeBlock.transactions.map(lower))
    }
    // Scoped by block hash (EIP-234): an unknown hash is an error, never an empty list, so a node that
    // lags behind Alchemy ends up retried rather than mistaken for "no such log".
    const logs = await provider.getLogs({
      blockHash,
      address: SNAPSHOT_DELEGATION_REGISTRY,
      topics: [[SET_DELEGATE_SIGNATURE_HASH, CLEAR_DELEGATE_SIGNATURE_HASH]],
    })
    return { blockHash, logs, transactions }
  }

  private static mismatchReason(candidate: DelegationLogCandidate, chainLogs: Log[]): string | undefined {
    // Alchemy's log index is block-wide (EIP-1767), the same numbering as eth_getLogs' logIndex.
    // A log of a reverted transaction is never returned, so it fails here too.
    const onChain = chainLogs.find(
      (chainLog) =>
        chainLog.removed !== true &&
        sameHex(chainLog.transactionHash, candidate.txHash) &&
        chainLog.logIndex === candidate.logIndex
    )
    if (!onChain) {
      return NO_REGISTRY_LOG
    }
    // The request already filters by address; checked again so a misbehaving RPC cannot widen it.
    if (!isSameAddress(onChain.address, SNAPSHOT_DELEGATION_REGISTRY)) {
      return 'log was not emitted by the delegate registry'
    }
    if (!sameHexList(onChain.topics, candidate.log.topics)) {
      return 'log topics differ from the chain'
    }
    // SetDelegate/ClearDelegate index all their arguments, so data is always 0x; a payload that
    // omits it is compared as 0x rather than skipping the check.
    const payloadData = typeof candidate.log.data === 'string' ? candidate.log.data : '0x'
    if (!sameHex(onChain.data, payloadData)) {
      return 'log data differs from the chain'
    }
    return undefined
  }
}

// The node's block at the delivered height is not the delivered block (see fetchRegistryLogs).
class NotTheDeliveredBlock extends Error {}

function lower(value: string) {
  return value.toLowerCase()
}

function isBlockNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function sameHex(a: unknown, b: unknown) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase()
}

function sameHexList(a: unknown[], b: unknown[]) {
  return a.length === b.length && a.every((value, i) => sameHex(value, b[i]))
}

// Short, URL-free description of an RPC failure: the ethers code plus the JSON-RPC error, if any.
// The full ethers error is not used because it embeds the request URL.
function describeRpcError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return String(error)
  }
  const { code, error: inner } = error as { code?: unknown; error?: { code?: unknown; message?: unknown } }
  const parts = [typeof code === 'string' ? code : undefined]
  if (inner && typeof inner === 'object') {
    parts.push([inner.code, inner.message].filter((part) => part !== undefined).join(' '))
  }
  const described = parts.filter(Boolean).join(': ')
  return described || (error instanceof Error ? error.message : 'unknown error')
}
