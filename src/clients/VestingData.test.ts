import { VestingStatus } from '../entities/Grant/types'
import { ErrorService } from '../services/ErrorService'
import VESTING_ABI from '../utils/contracts/abi/vesting/vesting.json'
import VESTING_V2_ABI from '../utils/contracts/abi/vesting/vesting_v2.json'
import { ContractVersion, TopicsByVersion } from '../utils/contracts/vesting'
import { ErrorCategory } from '../utils/errorCategories'
import logger from '../utils/logger'

import { ContractLog, getContractLogs } from './ContractLogs'
import { LOGS_TIMEOUT_MS, getVestingWithLogsFromAlchemy } from './VestingData'

jest.mock('./ContractLogs', () => ({ getContractLogs: jest.fn() }))

const mockContracts = new Map<unknown, Record<string, jest.Mock>>()
jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers')
  return {
    ...actual,
    ethers: {
      ...actual.ethers,
      providers: { JsonRpcProvider: jest.fn() },
      Contract: jest.fn((_address: string, abi: unknown) => mockContracts.get(abi) || mockContracts.get('token')),
    },
  }
})

const VESTING_ADDRESS = '0x7a3abf8897f31b56f09c6f69d074a393a905c1ac'
const MANA_ADDRESS = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'
const START = 1_582_070_400 // 2020-02-19
const DURATION = 4 * 365 * 24 * 60 * 60
const getContractLogsMock = getContractLogs as jest.MockedFunction<typeof getContractLogs>

function tokens(amount: number) {
  return `${amount}000000000000000000`
}

function contractLog(topic: string, timestamp: number, amount = 0): ContractLog {
  return {
    blockNumber: timestamp,
    logIndex: 0,
    transactionHash: '0x01',
    topics: [topic],
    data: `0x${(BigInt(amount) * BigInt(1e18)).toString(16)}`,
    timestamp,
  }
}

function rejected(message: string) {
  return jest.fn().mockRejectedValue(new Error(message))
}

function mockV1Contract() {
  mockContracts.set(VESTING_ABI, {
    start: jest.fn().mockResolvedValue(START),
    duration: jest.fn().mockResolvedValue(DURATION),
    cliff: jest.fn().mockResolvedValue(START),
    revoked: jest.fn().mockResolvedValue(false),
    released: jest.fn().mockResolvedValue(tokens(300)),
    releasableAmount: jest.fn().mockResolvedValue(tokens(100)),
    token: jest.fn().mockResolvedValue(MANA_ADDRESS),
  })
  mockContracts.set('token', { balanceOf: jest.fn().mockResolvedValue(tokens(700)) })
}

function mockV2Contract() {
  mockContracts.set(VESTING_V2_ABI, {
    getStart: jest.fn().mockResolvedValue(START),
    getPeriod: jest.fn().mockResolvedValue(DURATION),
    getCliff: jest.fn().mockResolvedValue(0),
    getIsLinear: jest.fn().mockResolvedValue(true),
    getVestedPerPeriod: jest.fn().mockResolvedValue([]),
    getReleased: jest.fn().mockResolvedValue(tokens(300)),
    getReleasable: jest.fn().mockResolvedValue(tokens(100)),
    getTotal: jest.fn().mockResolvedValue(tokens(1000)),
    getIsRevoked: jest.fn().mockResolvedValue(false),
    paused: jest.fn().mockResolvedValue(false),
    getToken: jest.fn().mockResolvedValue(MANA_ADDRESS),
  })
}

function mockV2CallsFailing() {
  mockContracts.set(VESTING_V2_ABI, { getStart: rejected('call revert exception') })
}

const v1Topics = TopicsByVersion[ContractVersion.V1]
const v2Topics = TopicsByVersion[ContractVersion.V2]
const logs = [
  contractLog(v1Topics.RELEASE, START + 100, 100),
  contractLog(v2Topics.RELEASE, START + 200, 50),
  contractLog(v1Topics.RELEASE, START + 300, 200),
  contractLog(v2Topics.PAUSED, START + 400),
  contractLog(v1Topics.TRANSFER_OWNERSHIP, START + 500),
]

function isoDate(seconds: number) {
  return new Date(seconds * 1000).toISOString()
}

describe('getVestingWithLogsFromAlchemy', () => {
  let reportSpy: jest.SpyInstance
  const unhandledRejections: unknown[] = []
  const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason)

  beforeAll(() => {
    process.on('unhandledRejection', onUnhandledRejection)
  })

  afterAll(() => {
    process.off('unhandledRejection', onUnhandledRejection)
  })

  beforeEach(() => {
    mockContracts.clear()
    getContractLogsMock.mockReset()
    unhandledRejections.length = 0
    reportSpy = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
    jest.spyOn(logger, 'log').mockImplementation(() => undefined)
  })

  afterEach(async () => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    // let any stray rejection reach the process before checking
    await new Promise((resolve) => setImmediate(resolve))
    expect(unhandledRejections).toEqual([])
  })

  it('decodes the logs with the V2 topics when the V2 data calls succeed', async () => {
    mockV2Contract()
    getContractLogsMock.mockResolvedValue(logs)

    const vesting = await getVestingWithLogsFromAlchemy(VESTING_ADDRESS)

    expect(getContractLogsMock).toHaveBeenCalledTimes(1)
    expect(vesting).toEqual(
      expect.objectContaining({ address: VESTING_ADDRESS, released: 300, releasable: 100, total: 1000, token: 'MANA' })
    )
    expect(vesting.logs).toEqual([
      { topic: v2Topics.PAUSED, timestamp: isoDate(START + 400) },
      { topic: v2Topics.RELEASE, timestamp: isoDate(START + 200), amount: 50 },
    ])
  })

  it('falls back to the V1 contract, fetching the logs once and decoding them with the V1 topics', async () => {
    mockV2CallsFailing()
    mockV1Contract()
    getContractLogsMock.mockResolvedValue(logs)

    const vesting = await getVestingWithLogsFromAlchemy(VESTING_ADDRESS)

    expect(getContractLogsMock).toHaveBeenCalledTimes(1)
    expect(vesting).toEqual(
      expect.objectContaining({
        address: VESTING_ADDRESS,
        released: 300,
        releasable: 100,
        vested: 400,
        total: 1000,
        token: 'MANA',
        status: VestingStatus.Finished,
        start_at: isoDate(START),
        finish_at: isoDate(START + DURATION),
      })
    )
    expect(vesting.logs).toEqual([
      { topic: v1Topics.RELEASE, timestamp: isoDate(START + 300), amount: 200 },
      { topic: v1Topics.RELEASE, timestamp: isoDate(START + 100), amount: 100 },
    ])
    expect(reportSpy).not.toHaveBeenCalled()
  })

  it('returns the vesting without logs and reports the error when the logs cannot be fetched', async () => {
    mockV2CallsFailing()
    mockV1Contract()
    getContractLogsMock.mockRejectedValue(new Error('range 20000 exceeds limit of 10000'))

    const vesting = await getVestingWithLogsFromAlchemy(VESTING_ADDRESS, 'proposal-id')

    expect(vesting).toEqual(expect.objectContaining({ released: 300, logs: [] }))
    expect(reportSpy).toHaveBeenCalledTimes(1)
    expect(reportSpy).toHaveBeenCalledWith(
      'Unable to fetch vesting contract logs',
      expect.objectContaining({ proposalId: 'proposal-id', category: ErrorCategory.Vesting })
    )
  })

  it('returns the vesting without logs and without reporting an error when the logs take too long', async () => {
    jest.useFakeTimers()
    mockV2Contract()
    let resolveLogs: (logs: ContractLog[]) => void = () => undefined
    getContractLogsMock.mockReturnValue(new Promise((resolve) => (resolveLogs = resolve)))

    const vestingPromise = getVestingWithLogsFromAlchemy(VESTING_ADDRESS)
    await jest.advanceTimersByTimeAsync(LOGS_TIMEOUT_MS)
    const vesting = await vestingPromise
    resolveLogs(logs)

    expect(vesting).toEqual(expect.objectContaining({ released: 300, logs: [] }))
    expect(reportSpy).not.toHaveBeenCalled()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('reports a logs scan that fails after the timeout without an unhandled rejection', async () => {
    jest.useFakeTimers()
    mockV2Contract()
    let rejectLogs: (error: Error) => void = () => undefined
    getContractLogsMock.mockReturnValue(new Promise((_resolve, reject) => (rejectLogs = reject)))

    const vestingPromise = getVestingWithLogsFromAlchemy(VESTING_ADDRESS)
    await jest.advanceTimersByTimeAsync(LOGS_TIMEOUT_MS)
    expect((await vestingPromise).logs).toEqual([])

    rejectLogs(new Error('missing response'))
    await jest.advanceTimersByTimeAsync(0)
    expect(reportSpy).toHaveBeenCalledWith('Unable to fetch vesting contract logs', expect.anything())
  })

  it('skips the logs when they are not wanted', async () => {
    mockV2Contract()

    const vesting = await getVestingWithLogsFromAlchemy(VESTING_ADDRESS, undefined, false)

    expect(getContractLogsMock).not.toHaveBeenCalled()
    expect(vesting).toEqual(expect.objectContaining({ released: 300, total: 1000, logs: [] }))
  })

  it('still throws and reports once, without scanning logs, when both the V2 and V1 data calls fail', async () => {
    mockV2CallsFailing()
    mockContracts.set(VESTING_ABI, { start: rejected('V1 call failed') })

    await expect(getVestingWithLogsFromAlchemy(VESTING_ADDRESS)).rejects.toThrow('V1 call failed')

    // an address that is not a vesting contract must not start a scan of its logs
    expect(getContractLogsMock).not.toHaveBeenCalled()
    expect(reportSpy).toHaveBeenCalledTimes(1)
    expect(reportSpy).toHaveBeenCalledWith(
      'Unable to fetch vesting contract data from alchemy',
      expect.objectContaining({ category: ErrorCategory.Vesting })
    )
  })
})
