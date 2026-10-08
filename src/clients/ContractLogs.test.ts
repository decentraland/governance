import { JsonRpcProvider } from '@ethersproject/providers'

import CacheService from '../services/CacheService'

import {
  FULL_RANGE_ATTEMPTS,
  LOG_CHUNK_SIZE,
  MAX_CONCURRENT_LOG_REQUESTS,
  MAX_CONTRACT_LOGS,
  MAX_RETRIES,
  REORG_SAFETY_BLOCKS,
  getBlockChunks,
  getContractLogs,
  getDeploymentBlock,
} from './ContractLogs'

const CONTRACT_ADDRESS = '0x7a3abf8897f31b56f09c6f69d074a393a905c1ac'
const DEPLOYMENT_BLOCK = 9_516_397
const HEAD = 9_545_000
const RELEASE_TOPIC = '0xfb81f9b30d73d830c3544b34d827c08142579ee75710b490bab0b3995468c565'

type RawLog = {
  blockNumber: string
  logIndex: string
  transactionHash: string
  topics: string[]
  data: string
  removed?: boolean
  blockTimestamp?: string
}

function toHex(value: number) {
  return `0x${value.toString(16)}`
}

function blockTimestamp(blockNumber: number) {
  return 1_600_000_000 + blockNumber * 12
}

function rawLog(blockNumber: number, logIndex = 0, { withTimestamp = true } = {}): RawLog {
  return {
    blockNumber: toHex(blockNumber),
    logIndex: toHex(logIndex),
    transactionHash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
    topics: [RELEASE_TOPIC],
    data: toHex(blockNumber),
    ...(withTimestamp ? { blockTimestamp: toHex(blockTimestamp(blockNumber)) } : {}),
  }
}

// The error ethers throws for a JSON-RPC error response keeps the payload in `body`
function rpcError(code: number, message: string) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code, message } })
  return Object.assign(new Error(`processing response error (body=${JSON.stringify(body)})`), { body })
}

function infuraRangeError(range: number) {
  return rpcError(-32602, `range ${range} exceeds limit of ${LOG_CHUNK_SIZE}`)
}

const INFURA_TOO_MANY_RESULTS = rpcError(-32005, 'query returned more than 10000 results. Try with this block range')
const ALCHEMY_TOO_MANY_RESULTS = rpcError(
  -32602,
  'Log response size exceeded. You can make eth_getLogs requests with up to a 2K block range and no limit on the response size, or you can request any block range with a cap of 10K logs in the response.'
)

type FakeChain = {
  head: number
  deploymentBlock: number
  logs: RawLog[]
  // widest eth_getLogs range accepted, in blocks. The default refuses wider ranges like Infura does,
  // Infinity accepts any range like Alchemy does
  maxBlockRange?: number
}

function createProvider(chain: FakeChain) {
  // the eth_getLogs ranges that were answered, not the refused ones
  const requestedRanges: [number, number][] = []
  const provider = {
    getBlockNumber: jest.fn(async () => chain.head),
    getCode: jest.fn(async (_address: string, block: number) => (block >= chain.deploymentBlock ? '0x6080' : '0x')),
    getBlock: jest.fn(async (blockNumber: number) => ({ number: blockNumber, timestamp: blockTimestamp(blockNumber) })),
    send: jest.fn(async (method: string, [filter]: [{ address: string; fromBlock: string; toBlock: string }]) => {
      expect(method).toBe('eth_getLogs')
      expect(filter.address).toBe(CONTRACT_ADDRESS)
      const fromBlock = Number(filter.fromBlock)
      const toBlock = Number(filter.toBlock)
      if (toBlock - fromBlock + 1 > (chain.maxBlockRange ?? LOG_CHUNK_SIZE)) {
        throw infuraRangeError(toBlock - fromBlock)
      }
      requestedRanges.push([fromBlock, toBlock])
      return chain.logs.filter((log) => Number(log.blockNumber) >= fromBlock && Number(log.blockNumber) <= toBlock)
    }),
  }
  return { provider, fakeProvider: provider as unknown as JsonRpcProvider, requestedRanges }
}

function expectContiguousChunks(ranges: [number, number][], fromBlock: number, toBlock: number) {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])
  expect(sorted[0][0]).toBe(fromBlock)
  expect(sorted[sorted.length - 1][1]).toBe(toBlock)
  sorted.forEach(([from, to], index) => {
    expect(to - from).toBeLessThan(LOG_CHUNK_SIZE)
    if (index > 0) {
      expect(from).toBe(sorted[index - 1][1] + 1)
    }
  })
}

describe('ContractLogs', () => {
  beforeEach(() => {
    CacheService.flush()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getBlockChunks', () => {
    it('splits a range into inclusive chunks of LOG_CHUNK_SIZE blocks clamped to the last block', () => {
      expect(getBlockChunks(100, 25_000)).toEqual([
        [100, 10_099],
        [10_100, 20_099],
        [20_100, 25_000],
      ])
    })

    it('returns a single block range and no range for an empty interval', () => {
      expect(getBlockChunks(5, 5)).toEqual([[5, 5]])
      expect(getBlockChunks(10, 9)).toEqual([])
    })
  })

  describe('getDeploymentBlock', () => {
    it('finds the first block with code and caches it', async () => {
      const { provider, fakeProvider } = createProvider({
        head: 21_000_000,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [],
      })

      expect(await getDeploymentBlock(fakeProvider, CONTRACT_ADDRESS, 21_000_000)).toBe(DEPLOYMENT_BLOCK)
      expect(provider.getCode.mock.calls.length).toBeLessThanOrEqual(Math.ceil(Math.log2(21_000_000)) + 1)

      provider.getCode.mockClear()
      expect(await getDeploymentBlock(fakeProvider, CONTRACT_ADDRESS, 21_000_000)).toBe(DEPLOYMENT_BLOCK)
      expect(provider.getCode).not.toHaveBeenCalled()
    })

    it('finds the deployment block anywhere between the genesis block and the head', async () => {
      const head = 40
      for (let deploymentBlock = 0; deploymentBlock <= head; deploymentBlock++) {
        CacheService.flush()
        const { fakeProvider } = createProvider({ head, deploymentBlock, logs: [] })
        expect(await getDeploymentBlock(fakeProvider, CONTRACT_ADDRESS, head)).toBe(deploymentBlock)
      }
    })

    it('fails without caching when the address has no code', async () => {
      const { provider, fakeProvider } = createProvider({ head: 1000, deploymentBlock: Infinity, logs: [] })

      await expect(getDeploymentBlock(fakeProvider, CONTRACT_ADDRESS, 1000)).rejects.toThrow('No contract code')
      await expect(getDeploymentBlock(fakeProvider, CONTRACT_ADDRESS, 1000)).rejects.toThrow('No contract code')
      expect(provider.getCode).toHaveBeenCalledTimes(2)
    })
  })

  describe('getContractLogs', () => {
    it('asks for the whole history in one request when the provider accepts it', async () => {
      const logs = [rawLog(DEPLOYMENT_BLOCK + 17), rawLog(HEAD)]
      const { provider, fakeProvider, requestedRanges } = createProvider({
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs,
        maxBlockRange: Infinity,
      })

      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(requestedRanges).toEqual([[0, HEAD]])
      expect(provider.getCode).not.toHaveBeenCalled()
      expect(result.map((log) => log.blockNumber)).toEqual([DEPLOYMENT_BLOCK + 17, HEAD])
    })

    it('asks for the whole history again when its block range is refused', async () => {
      const { provider, fakeProvider, requestedRanges } = createProvider({
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [rawLog(DEPLOYMENT_BLOCK + 17)],
        maxBlockRange: Infinity,
      })
      provider.send.mockRejectedValueOnce(infuraRangeError(HEAD))

      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(provider.send).toHaveBeenCalledTimes(2)
      expect(requestedRanges).toEqual([[0, HEAD]])
      expect(provider.getCode).not.toHaveBeenCalled()
      expect(result).toHaveLength(1)
    })

    it('falls back to inclusive chunks from the deployment block when every whole-history request is refused', async () => {
      const logs = [rawLog(DEPLOYMENT_BLOCK + 17), rawLog(DEPLOYMENT_BLOCK + LOG_CHUNK_SIZE), rawLog(HEAD)]
      const { provider, fakeProvider, requestedRanges } = createProvider({
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs,
      })

      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      const chunks = Math.ceil((HEAD - DEPLOYMENT_BLOCK + 1) / LOG_CHUNK_SIZE)
      expect(provider.send).toHaveBeenCalledTimes(FULL_RANGE_ATTEMPTS + chunks)
      expect(requestedRanges).toHaveLength(chunks)
      expectContiguousChunks(requestedRanges, DEPLOYMENT_BLOCK, HEAD)
      expect(result.map((log) => log.blockNumber)).toEqual([
        DEPLOYMENT_BLOCK + 17,
        DEPLOYMENT_BLOCK + LOG_CHUNK_SIZE,
        HEAD,
      ])
    })

    it('keeps at most MAX_CONCURRENT_LOG_REQUESTS chunk requests in flight', async () => {
      const head = DEPLOYMENT_BLOCK + 20 * LOG_CHUNK_SIZE - 1
      const { provider, fakeProvider, requestedRanges } = createProvider({
        head,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [],
      })
      const send = provider.send.getMockImplementation()!
      let inFlight = 0
      let maxInFlight = 0
      provider.send.mockImplementation(async (method, params) => {
        inFlight++
        maxInFlight = Math.max(maxInFlight, inFlight)
        try {
          await new Promise((resolve) => setImmediate(resolve))
          return await send(method, params)
        } finally {
          inFlight--
        }
      })

      await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(requestedRanges).toHaveLength(20)
      expect(maxInFlight).toBe(MAX_CONCURRENT_LOG_REQUESTS)
    })

    it('returns logs sorted by block and log index, without removed logs', async () => {
      const logs = [
        rawLog(DEPLOYMENT_BLOCK + 20_001, 0),
        rawLog(DEPLOYMENT_BLOCK + 5, 3),
        { ...rawLog(DEPLOYMENT_BLOCK + 6, 0), removed: true },
        rawLog(DEPLOYMENT_BLOCK + 5, 1),
      ]
      const { fakeProvider } = createProvider({ head: HEAD, deploymentBlock: DEPLOYMENT_BLOCK, logs })

      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(result.map((log) => [log.blockNumber, log.logIndex])).toEqual([
        [DEPLOYMENT_BLOCK + 5, 1],
        [DEPLOYMENT_BLOCK + 5, 3],
        [DEPLOYMENT_BLOCK + 20_001, 0],
      ])
    })

    it('uses blockTimestamp from the logs and fetches each block without it only once', async () => {
      const blockWithoutTimestamp = DEPLOYMENT_BLOCK + 100
      const logs = [
        rawLog(DEPLOYMENT_BLOCK + 1),
        rawLog(blockWithoutTimestamp, 0, { withTimestamp: false }),
        rawLog(blockWithoutTimestamp, 1, { withTimestamp: false }),
      ]
      const { provider, fakeProvider } = createProvider({ head: HEAD, deploymentBlock: DEPLOYMENT_BLOCK, logs })

      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(provider.getBlock).toHaveBeenCalledTimes(1)
      expect(provider.getBlock).toHaveBeenCalledWith(blockWithoutTimestamp)
      expect(result.map((log) => log.timestamp)).toEqual([
        blockTimestamp(DEPLOYMENT_BLOCK + 1),
        blockTimestamp(blockWithoutTimestamp),
        blockTimestamp(blockWithoutTimestamp),
      ])
    })

    it.each([
      ['answered in one request', Infinity],
      ['answered in chunks', LOG_CHUNK_SIZE],
    ])('only scans the blocks added since the cached scan (history %s)', async (_case, maxBlockRange) => {
      const chain = {
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [rawLog(DEPLOYMENT_BLOCK + 1)],
        maxBlockRange,
      }
      const { provider, fakeProvider, requestedRanges } = createProvider(chain)
      await getContractLogs(fakeProvider, CONTRACT_ADDRESS)
      provider.getCode.mockClear()
      provider.send.mockClear()
      requestedRanges.length = 0

      // a log inside the reorg window of the first scan, and one in the new blocks
      chain.logs.push(rawLog(HEAD - 1), rawLog(HEAD + 500))
      chain.head = HEAD + 1000
      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(provider.getCode).not.toHaveBeenCalled()
      expect(provider.send).toHaveBeenCalledTimes(1)
      expect(requestedRanges).toEqual([[HEAD - REORG_SAFETY_BLOCKS + 1, HEAD + 1000]])
      expect(result.map((log) => log.blockNumber)).toEqual([DEPLOYMENT_BLOCK + 1, HEAD - 1, HEAD + 500])
    })

    it('scans the blocks that could still be reorged again, without duplicating their logs', async () => {
      const chain = { head: HEAD, deploymentBlock: HEAD - 10, logs: [rawLog(HEAD - 5)] }
      const { fakeProvider, requestedRanges } = createProvider(chain)
      await getContractLogs(fakeProvider, CONTRACT_ADDRESS)
      requestedRanges.length = 0

      const result = await getContractLogs(fakeProvider, CONTRACT_ADDRESS)

      expect(requestedRanges).toEqual([[HEAD - 10, HEAD]])
      expect(result.map((log) => log.blockNumber)).toEqual([HEAD - 5])
    })

    it('shares one scan between concurrent calls for the same address', async () => {
      const { provider, fakeProvider } = createProvider({
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [rawLog(DEPLOYMENT_BLOCK + 1)],
      })

      const [first, second] = await Promise.all([
        getContractLogs(fakeProvider, CONTRACT_ADDRESS),
        getContractLogs(fakeProvider, CONTRACT_ADDRESS.toUpperCase().replace('0X', '0x')),
      ])

      expect(second).toBe(first)
      expect(provider.getBlockNumber).toHaveBeenCalledTimes(1)
      expect(provider.send).toHaveBeenCalledTimes(
        FULL_RANGE_ATTEMPTS + Math.ceil((HEAD - DEPLOYMENT_BLOCK + 1) / LOG_CHUNK_SIZE)
      )
    })

    describe('when the contract has more than MAX_CONTRACT_LOGS logs', () => {
      it('fails as soon as the whole-history request has too many results, without scanning chunks', async () => {
        const { provider, fakeProvider } = createProvider({ head: HEAD, deploymentBlock: DEPLOYMENT_BLOCK, logs: [] })
        provider.send.mockRejectedValueOnce(ALCHEMY_TOO_MANY_RESULTS)

        await expect(getContractLogs(fakeProvider, CONTRACT_ADDRESS)).rejects.toThrow(
          `has more than ${MAX_CONTRACT_LOGS} logs`
        )
        expect(provider.send).toHaveBeenCalledTimes(1)
        expect(provider.getCode).not.toHaveBeenCalled()
      })

      it('fails when the whole history returns more logs than the limit', async () => {
        const logs = Array.from({ length: MAX_CONTRACT_LOGS + 1 }, (_, index) => rawLog(DEPLOYMENT_BLOCK, index))
        const { fakeProvider } = createProvider({
          head: HEAD,
          deploymentBlock: DEPLOYMENT_BLOCK,
          logs,
          maxBlockRange: Infinity,
        })

        await expect(getContractLogs(fakeProvider, CONTRACT_ADDRESS)).rejects.toThrow(
          `has more than ${MAX_CONTRACT_LOGS} logs`
        )
      })

      it('fails without retrying or splitting a chunk that has too many results', async () => {
        const { provider, fakeProvider } = createProvider({
          head: DEPLOYMENT_BLOCK + 100,
          deploymentBlock: DEPLOYMENT_BLOCK,
          logs: [],
        })
        const send = provider.send.getMockImplementation()!
        provider.send.mockImplementation(async (method, params) => {
          await send(method, params) // refuses the whole-history requests
          throw INFURA_TOO_MANY_RESULTS
        })

        await expect(getContractLogs(fakeProvider, CONTRACT_ADDRESS)).rejects.toThrow(
          `has more than ${MAX_CONTRACT_LOGS} logs`
        )
        expect(provider.send).toHaveBeenCalledTimes(FULL_RANGE_ATTEMPTS + 1)
      })

      it('stops taking chunks once their logs add up to more than the limit', async () => {
        const chunks = 20
        const { provider, fakeProvider, requestedRanges } = createProvider({
          head: DEPLOYMENT_BLOCK + chunks * LOG_CHUNK_SIZE - 1,
          deploymentBlock: DEPLOYMENT_BLOCK,
          logs: [],
        })
        const send = provider.send.getMockImplementation()!
        const logsPerChunk = Math.ceil(MAX_CONTRACT_LOGS / 3)
        provider.send.mockImplementation(async (method, params) => {
          await send(method, params) // refuses the whole-history requests
          return Array.from({ length: logsPerChunk }, (_, index) => rawLog(Number(params[0].fromBlock), index))
        })

        await expect(getContractLogs(fakeProvider, CONTRACT_ADDRESS)).rejects.toThrow(
          `has more than ${MAX_CONTRACT_LOGS} logs`
        )
        expect(requestedRanges.length).toBeLessThan(chunks)
      })
    })

    it.each([
      ['an HTTP 429', new Error('bad response (status=429, body="Too Many Requests")')],
      ['a rate limit', rpcError(-32005, 'request rate limited')],
      ['an unavailable upstream', rpcError(-32603, 'service temporarily unavailable')],
      ['an upstream behind the head', rpcError(-32602, 'block range extends beyond current head block')],
    ])('retries a request after %s', async (_case, error) => {
      jest.useFakeTimers()
      const { provider, fakeProvider } = createProvider({
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [rawLog(DEPLOYMENT_BLOCK + 1)],
        maxBlockRange: Infinity,
      })
      provider.send.mockRejectedValueOnce(error).mockRejectedValueOnce(error)

      const scan = getContractLogs(fakeProvider, CONTRACT_ADDRESS)
      await jest.advanceTimersByTimeAsync(5_000)

      expect(await scan).toHaveLength(1)
      expect(provider.send).toHaveBeenCalledTimes(3)
    })

    it('gives up after MAX_RETRIES retries', async () => {
      jest.useFakeTimers()
      const { provider, fakeProvider } = createProvider({ head: HEAD, deploymentBlock: DEPLOYMENT_BLOCK, logs: [] })
      provider.send.mockRejectedValue(new Error('bad response (status=429, body="Too Many Requests")'))

      const scan = expect(getContractLogs(fakeProvider, CONTRACT_ADDRESS)).rejects.toThrow('status=429')
      await jest.advanceTimersByTimeAsync(60_000)
      await scan

      expect(provider.send).toHaveBeenCalledTimes(MAX_RETRIES + 1)
    })

    it('fails without retrying other errors, and does not keep the failed scan', async () => {
      const { provider, fakeProvider } = createProvider({
        head: HEAD,
        deploymentBlock: DEPLOYMENT_BLOCK,
        logs: [rawLog(DEPLOYMENT_BLOCK + 1)],
        maxBlockRange: Infinity,
      })
      provider.send.mockRejectedValueOnce(new Error('invalid argument'))

      await expect(getContractLogs(fakeProvider, CONTRACT_ADDRESS)).rejects.toThrow('invalid argument')
      expect(provider.send).toHaveBeenCalledTimes(1)

      expect(await getContractLogs(fakeProvider, CONTRACT_ADDRESS)).toHaveLength(1)
    })
  })
})
