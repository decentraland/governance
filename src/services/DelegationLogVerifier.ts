import type { Log } from '@ethersproject/providers'

import { isSameAddress } from '../entities/Snapshot/utils'
import { AlchemyBlock, AlchemyLog } from '../shared/types/events'

import RpcService from './RpcService'

// Snapshot's DelegateRegistry is deployed at the same address on every supported chain.
export const SNAPSHOT_DELEGATION_REGISTRY = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'
export const CLEAR_DELEGATE_SIGNATURE_HASH = '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064'
export const SET_DELEGATE_SIGNATURE_HASH = '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e'

// How long after its block a delivery may keep failing to read the chain before we stop asking
// Alchemy to retry it. Alchemy itself stops retrying 10 minutes (Free/PAYG) to 1 hour (Enterprise)
// after the first attempt, so this never cuts a retry short; it only bounds late or replayed
// deliveries, which are then dropped and reported with enough detail to backfill by hand.
export const VERIFICATION_GRACE_PERIOD_MS = 60 * 60 * 1000

const BLOCK_HASH_REGEX = /^0x[0-9a-fA-F]{64}$/

export type DelegationLogCandidate = { txHash: string; logIndex: number; log: AlchemyLog }

export type DelegationVerification<T extends DelegationLogCandidate> = {
  verified: T[]
  rejected: { candidate: T; reason: string }[]
  // Set when the chain could not be read for this block. Nothing was verified or rejected: the
  // whole delivery must be retried. Holds a short description of the RPC failure.
  unavailable?: string
}

/**
 * The Alchemy HMAC proves a payload came from Alchemy, not which contract emitted each log, and the
 * webhook query does not reliably carry the emitter. Any contract can emit a log with the registry's
 * SetDelegate/ClearDelegate topics, so a log is only trusted once the chain shows the registry
 * emitted that exact log (same transaction, index, topics and data) in the delivered block.
 *
 * The chain is read with ONE eth_getLogs per delivery, filtered to the registry's address. Forged
 * logs are never even returned by the node, and the RPC cost does not grow with how many forged logs
 * an attacker packs into a block.
 */
export class DelegationLogVerifier {
  static async verify<T extends DelegationLogCandidate>(
    candidates: T[],
    block: Pick<AlchemyBlock, 'hash' | 'number' | 'timestamp'>,
    now = Date.now()
  ): Promise<DelegationVerification<T>> {
    if (candidates.length === 0) {
      return { verified: [], rejected: [] }
    }

    if (!isBlockHash(block.hash) && !isBlockNumber(block.number)) {
      // Nothing to look the logs up by, and a retry carries the same payload: fail closed.
      return {
        verified: [],
        rejected: candidates.map((candidate) => ({ candidate, reason: 'delivery names no block' })),
      }
    }

    let chainLogs: Log[]
    try {
      chainLogs = await this.fetchRegistryLogs(block)
    } catch (error) {
      // Any failure (network, 5xx, 429, timeout, or a block our node does not know yet or no longer
      // knows after a reorg) says nothing about the logs themselves. A NaN timestamp compares false,
      // so a malformed payload falls on the drop side and can never be retried forever.
      const unavailable = describeRpcError(error)
      if (now - block.timestamp * 1000 < VERIFICATION_GRACE_PERIOD_MS) {
        return { verified: [], rejected: [], unavailable }
      }
      const reason = `could not read the block from the RPC: ${unavailable}`
      return { verified: [], rejected: candidates.map((candidate) => ({ candidate, reason })) }
    }

    const result: DelegationVerification<T> = { verified: [], rejected: [] }
    for (const candidate of candidates) {
      const reason = this.mismatchReason(candidate, chainLogs)
      if (reason) {
        result.rejected.push({ candidate, reason })
      } else {
        result.verified.push(candidate)
      }
    }
    return result
  }

  private static async fetchRegistryLogs(block: Pick<AlchemyBlock, 'hash' | 'number'>): Promise<Log[]> {
    const provider = RpcService.getEnvironmentProvider()
    let blockHash = block.hash
    if (!isBlockHash(blockHash)) {
      // Fallback for a webhook query that does not request the block hash: the canonical block at
      // that height. If the delivered block was reorged out, its logs will not match and are dropped;
      // Alchemy delivers the canonical block separately.
      const canonical = await provider.getBlock(block.number)
      if (!canonical) {
        throw new Error(`block ${block.number} not found`)
      }
      blockHash = canonical.hash
    }
    // Scoped by block hash (EIP-234): an unknown hash is an error, never an empty list, so a node that
    // lags behind Alchemy ends up retried rather than mistaken for "no such log".
    return provider.getLogs({
      blockHash,
      address: SNAPSHOT_DELEGATION_REGISTRY,
      topics: [[SET_DELEGATE_SIGNATURE_HASH, CLEAR_DELEGATE_SIGNATURE_HASH]],
    })
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
      return 'no delegate registry log at that transaction and index'
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

function isBlockHash(value: unknown): value is string {
  return typeof value === 'string' && BLOCK_HASH_REGEX.test(value)
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
