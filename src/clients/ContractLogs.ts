import { JsonRpcProvider } from '@ethersproject/providers'

import CacheService, { TTL_24_HS } from '../services/CacheService'

export type ContractLog = {
  blockNumber: number
  logIndex: number
  transactionHash: string
  topics: string[]
  data: string
  timestamp: number // seconds
}

type RawLog = {
  blockNumber: string
  logIndex: string
  transactionHash: string
  topics: string[]
  data: string
  removed?: boolean
  blockTimestamp?: string
}

type CachedContractLogs = {
  toBlock: number
  logs: ContractLog[]
}

// rpc.decentraland.org routes each request to Alchemy or Infura, and Infura rejects eth_getLogs
// ranges wider than 10,000 blocks, so every request covers at most [from, from + 9999].
export const LOG_CHUNK_SIZE = 10_000
export const MAX_CONCURRENT_LOG_REQUESTS = 5
export const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 500
// A chunk that is still refused after this many halvings (10,000 -> ~156 blocks) is a real error
const MAX_CHUNK_SPLITS = 6
// Blocks this close to the head can still be reorged, so they are scanned again on the next call
// instead of being cached
export const REORG_SAFETY_BLOCKS = 64

const RANGE_TOO_LARGE_ERROR = /exceeds limit of \d+|more than \d+ results|block range|response size exceeded/i
const TRANSIENT_ERROR =
  /\b429\b|-32005|too many requests|rate limit|timeout|timed out|ETIMEDOUT|ECONNRESET|missing response|bad response|header not found/i

const inFlightScans = new Map<string, Promise<ContractLog[]>>()

function deploymentBlockKey(address: string) {
  return `contract-deployment-block-${address}`
}

function contractLogsKey(address: string) {
  return `contract-logs-${address}`
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    // ethers keeps the JSON-RPC error payload in `body`, and its message does not always include it
    const body = (error as Error & { body?: unknown }).body
    return `${error.message} ${typeof body === 'string' ? body : ''}`
  }
  return String(error)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetries<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request()
    } catch (error) {
      if (attempt >= MAX_RETRIES || !TRANSIENT_ERROR.test(getErrorText(error))) {
        throw error
      }
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt)
    }
  }
}

// Runs `task` over `items` with at most `limit` tasks in flight, and stops taking new items once one fails
async function mapWithConcurrency<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  let failed = false
  async function worker() {
    while (!failed && next < items.length) {
      const index = next++
      try {
        results[index] = await task(items[index])
      } catch (error) {
        failed = true
        throw error
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

export function getBlockChunks(fromBlock: number, toBlock: number) {
  const chunks: [number, number][] = []
  for (let from = fromBlock; from <= toBlock; from += LOG_CHUNK_SIZE) {
    chunks.push([from, Math.min(from + LOG_CHUNK_SIZE - 1, toBlock)])
  }
  return chunks
}

async function hasCode(provider: JsonRpcProvider, address: string, block: number) {
  const code = await withRetries(() => provider.getCode(address, block))
  return code !== '0x'
}

// Binary search for the first block where the contract has code: no log can be older than that.
// There is no fallback start block when getCode fails: a guessed start either misses older events
// (the previous 2022 constant skipped every release of contracts deployed earlier) or costs
// thousands of requests from genesis. The error propagates instead, so the caller can serve the
// vesting without logs and report it, and the next call tries again.
export async function getDeploymentBlock(provider: JsonRpcProvider, address: string, head: number) {
  const cacheKey = deploymentBlockKey(address)
  const cached = CacheService.get<number>(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  if (!(await hasCode(provider, address, head))) {
    throw new Error(`No contract code found at ${address} on block ${head}`)
  }
  let low = 0
  let high = head
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (await hasCode(provider, address, middle)) {
      high = middle
    } else {
      low = middle + 1
    }
  }

  CacheService.set(cacheKey, low) // a deployment block never changes, so it does not expire
  return low
}

async function getRawLogs(
  provider: JsonRpcProvider,
  address: string,
  fromBlock: number,
  toBlock: number,
  splits = 0
): Promise<RawLog[]> {
  try {
    return await withRetries(() =>
      provider.send('eth_getLogs', [{ address, fromBlock: toHex(fromBlock), toBlock: toHex(toBlock) }])
    )
  } catch (error) {
    if (fromBlock >= toBlock || splits >= MAX_CHUNK_SPLITS || !RANGE_TOO_LARGE_ERROR.test(getErrorText(error))) {
      throw error
    }
    const middle = Math.floor((fromBlock + toBlock) / 2)
    const firstHalf = await getRawLogs(provider, address, fromBlock, middle, splits + 1)
    const secondHalf = await getRawLogs(provider, address, middle + 1, toBlock, splits + 1)
    return [...firstHalf, ...secondHalf]
  }
}

function toHex(value: number) {
  return `0x${value.toString(16)}`
}

// eth_getLogs results usually carry `blockTimestamp` (ethers' getLogs drops it, hence the raw
// `send`). Blocks of logs without it are fetched once each.
async function toContractLogs(provider: JsonRpcProvider, rawLogs: RawLog[]): Promise<ContractLog[]> {
  const logs = rawLogs.filter((log) => !log.removed)
  const blocksWithoutTimestamp = [
    ...new Set(logs.filter((log) => !log.blockTimestamp).map((log) => Number(log.blockNumber))),
  ]
  const blocks = await mapWithConcurrency(blocksWithoutTimestamp, MAX_CONCURRENT_LOG_REQUESTS, (blockNumber) =>
    withRetries(() => provider.getBlock(blockNumber))
  )
  const timestampByBlock = new Map(blocks.map((block) => [block.number, block.timestamp]))

  return logs.map((log) => {
    const blockNumber = Number(log.blockNumber)
    return {
      blockNumber,
      logIndex: Number(log.logIndex),
      transactionHash: log.transactionHash,
      topics: log.topics,
      data: log.data,
      timestamp: log.blockTimestamp ? Number(log.blockTimestamp) : Number(timestampByBlock.get(blockNumber)),
    }
  })
}

function compareLogs(a: ContractLog, b: ContractLog) {
  return a.blockNumber - b.blockNumber || a.logIndex - b.logIndex
}

async function scanContractLogs(provider: JsonRpcProvider, address: string): Promise<ContractLog[]> {
  const head = await withRetries(() => provider.getBlockNumber())
  const cacheKey = contractLogsKey(address)
  const cached = CacheService.get<CachedContractLogs>(cacheKey)
  const fromBlock = cached ? cached.toBlock + 1 : await getDeploymentBlock(provider, address, head)

  const chunks = await mapWithConcurrency(getBlockChunks(fromBlock, head), MAX_CONCURRENT_LOG_REQUESTS, ([from, to]) =>
    getRawLogs(provider, address, from, to)
  )
  const newLogs = await toContractLogs(provider, chunks.flat())
  const logs = [...(cached?.logs || []), ...newLogs].sort(compareLogs)

  // The cache is in-process: it is not shared between instances and it is lost on every deploy
  const safeBlock = Math.max(head - REORG_SAFETY_BLOCKS, fromBlock - 1)
  CacheService.set<CachedContractLogs>(
    cacheKey,
    { toBlock: safeBlock, logs: logs.filter((log) => log.blockNumber <= safeBlock) },
    TTL_24_HS
  )

  return logs
}

/**
 * Returns every log emitted by a contract, sorted by block and log index, with block timestamps.
 * The first call scans from the contract deployment block in chunks; later calls only scan the
 * blocks added since. Concurrent calls for the same address share a single scan.
 */
export function getContractLogs(provider: JsonRpcProvider, contractAddress: string): Promise<ContractLog[]> {
  const address = contractAddress.toLowerCase()
  const inFlightScan = inFlightScans.get(address)
  if (inFlightScan) {
    return inFlightScan
  }

  const scan = scanContractLogs(provider, address).finally(() => inFlightScans.delete(address))
  inFlightScans.set(address, scan)
  return scan
}
