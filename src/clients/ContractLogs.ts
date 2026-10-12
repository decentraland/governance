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

// rpc.decentraland.org routes each request to Alchemy (any range) or Infura (10,000 blocks max)
export const FULL_RANGE_ATTEMPTS = 4
export const LOG_CHUNK_SIZE = 10_000
export const MAX_CONCURRENT_LOG_REQUESTS = 5
export const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 500
export const MAX_CONTRACT_LOGS = 10_000
// Blocks this close to the head can still be reorged, so they are not cached
export const REORG_SAFETY_BLOCKS = 64

// Infura: "range N exceeds limit of 10000". Another attempt can reach Alchemy, which accepts it.
const BLOCK_RANGE_LIMIT_ERROR = /exceeds limit of \d+/i
// JSON-RPC "invalid params", in case an upstream words its range limit differently
const INVALID_PARAMS_ERROR = /-32602/
// Infura: "query returned more than 10000 results" (-32005). Alchemy: "Log response size exceeded",
// "Response is too big" / "Exceeded max limit of N" (-32008). The contract has too many logs.
const TOO_MANY_RESULTS_ERROR = /more than \d+ results|response size exceeded|response is too big|exceeded max limit/i
const TRANSIENT_ERROR =
  /\b429\b|-32005|-32603|too many requests|rate limit|timeout|timed out|ETIMEDOUT|ECONNRESET|missing response|bad response|header not found|temporarily unavailable|beyond current head/i

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

function isRequestTooLarge(errorText: string) {
  return BLOCK_RANGE_LIMIT_ERROR.test(errorText) || TOO_MANY_RESULTS_ERROR.test(errorText)
}

function tooManyLogsError(address: string) {
  return new Error(`Contract ${address} has more than ${MAX_CONTRACT_LOGS} logs`)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetries<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request()
    } catch (error) {
      const text = getErrorText(error)
      // Too-large requests are checked first: Infura's results limit shares the -32005 code of its rate limit
      if (attempt >= MAX_RETRIES || isRequestTooLarge(text) || !TRANSIENT_ERROR.test(text)) {
        throw error
      }
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt)
    }
  }
}

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

// Binary search for the first block where the contract has code: no log can be older than that
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

function getRawLogs(provider: JsonRpcProvider, address: string, fromBlock: number, toBlock: number) {
  return withRetries<RawLog[]>(() =>
    provider.send('eth_getLogs', [{ address, fromBlock: toHex(fromBlock), toBlock: toHex(toBlock) }])
  )
}

// Returns null when every attempt was refused for its block range
async function getAllRawLogsAtOnce(provider: JsonRpcProvider, address: string, toBlock: number) {
  for (let attempt = 0; attempt < FULL_RANGE_ATTEMPTS; attempt++) {
    let logs: RawLog[]
    try {
      logs = await getRawLogs(provider, address, 0, toBlock)
    } catch (error) {
      const text = getErrorText(error)
      if (TOO_MANY_RESULTS_ERROR.test(text)) {
        throw tooManyLogsError(address)
      }
      if (!BLOCK_RANGE_LIMIT_ERROR.test(text) && !INVALID_PARAMS_ERROR.test(text)) {
        throw error
      }
      continue
    }
    if (logs.length > MAX_CONTRACT_LOGS) {
      throw tooManyLogsError(address)
    }
    return logs
  }
  return null
}

async function getRawLogsInChunks(
  provider: JsonRpcProvider,
  address: string,
  fromBlock: number,
  toBlock: number,
  knownLogs: number
) {
  let logCount = knownLogs
  const chunks = await mapWithConcurrency(
    getBlockChunks(fromBlock, toBlock),
    MAX_CONCURRENT_LOG_REQUESTS,
    async ([from, to]) => {
      let logs: RawLog[]
      try {
        logs = await getRawLogs(provider, address, from, to)
      } catch (error) {
        throw TOO_MANY_RESULTS_ERROR.test(getErrorText(error)) ? tooManyLogsError(address) : error
      }
      logCount += logs.length
      if (logCount > MAX_CONTRACT_LOGS) {
        throw tooManyLogsError(address)
      }
      return logs
    }
  )
  return chunks.flat()
}

function toHex(value: number) {
  return `0x${value.toString(16)}`
}

// ethers' getLogs drops `blockTimestamp`, hence the raw `send`
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

  let fromBlock = cached ? cached.toBlock + 1 : 0
  let rawLogs = cached ? null : await getAllRawLogsAtOnce(provider, address, head)
  if (!rawLogs) {
    if (!cached) {
      fromBlock = await getDeploymentBlock(provider, address, head)
    }
    rawLogs = await getRawLogsInChunks(provider, address, fromBlock, head, cached?.logs.length || 0)
  }

  const newLogs = await toContractLogs(provider, rawLogs)
  const logs = [...(cached?.logs || []), ...newLogs].sort(compareLogs)

  const safeBlock = Math.max(head - REORG_SAFETY_BLOCKS, fromBlock - 1)
  CacheService.set<CachedContractLogs>(
    cacheKey,
    { toBlock: safeBlock, logs: logs.filter((log) => log.blockNumber <= safeBlock) },
    TTL_24_HS
  )

  return logs
}

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
