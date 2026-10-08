import { ChainId } from '@dcl/schemas'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import { VestingStatus } from '../entities/Grant/types'
import { ErrorService } from '../services/ErrorService'
import RpcService from '../services/RpcService'
import ERC20_ABI from '../utils/contracts/abi/ERC20.abi.json'
import VESTING_ABI from '../utils/contracts/abi/vesting/vesting.json'
import VESTING_V2_ABI from '../utils/contracts/abi/vesting/vesting_v2.json'
import { ContractVersion, TopicsByVersion } from '../utils/contracts/vesting'
import { ErrorCategory } from '../utils/errorCategories'
import logger from '../utils/logger'

import { ContractLog, getContractLogs } from './ContractLogs'

export type VestingLog = {
  topic: string
  timestamp: string
  amount?: number
}

export type Vesting = {
  start_at: string
  finish_at: string
  released: number
  releasable: number
  vested: number
  total: number
  address: string
  status: VestingStatus
  token: string
  cliff: string
  vestedPerPeriod: number[]
}

export type VestingWithLogs = Vesting & { logs: VestingLog[] }

export function toISOString(seconds: number) {
  return new Date(seconds * 1000).toISOString()
}

export function getVestingDates(contractStart: number, contractEndsTimestamp: number) {
  const vestingStartAt = toISOString(contractStart)
  const vestingFinishAt = toISOString(contractEndsTimestamp)
  return {
    vestingStartAt,
    vestingFinishAt,
  }
}

function parseContractValue(value: unknown) {
  return Math.round(Number(value) / 1e18)
}

// A cold scan of a contract's logs usually takes one or two requests, but when it falls back to chunks it can take
// minutes (about 4 for a 2020 contract), so a request does not wait for it longer than this. The scan keeps running
// and fills the cache for the next request.
export const LOGS_TIMEOUT_MS = 3_000

function tokenAmount(wei: bigint) {
  return Number(wei) / 1e18
}

function compareChainOrder(a: ContractLog, b: ContractLog) {
  return a.blockNumber - b.blockNumber || a.logIndex - b.logIndex
}

// A V1 contract (TokenVesting, DecentralandVesting) emits `Released(released)`: the running total released so far, not
// the amount of that release. A V2 contract (PeriodicTokenVesting) emits the amount of each release. A V1 release is
// decoded as the difference from the previous total, which needs the logs in chain order and from the deployment on.
function decodeVestingLogs(logs: ContractLog[], version: ContractVersion) {
  const topics = TopicsByVersion[version]
  const logsData: VestingLog[] = []
  let releasedSoFar = BigInt(0)

  const chainOrderedLogs = [...logs].sort(compareChainOrder)
  chainOrderedLogs.forEach((log) => {
    const timestamp = toISOString(log.timestamp)
    switch (log.topics[0]) {
      case topics.REVOKE:
        logsData.push({ topic: topics.REVOKE, timestamp })
        break
      case topics.PAUSED:
        logsData.push({ topic: topics.PAUSED, timestamp })
        break
      case topics.UNPAUSED:
        logsData.push({ topic: topics.UNPAUSED, timestamp })
        break
      case topics.RELEASE: {
        let amount = BigInt(log.data)
        if (version === ContractVersion.V1) {
          const total = amount
          amount = total - releasedSoFar
          releasedSoFar = total
        }
        logsData.push({ topic: topics.RELEASE, timestamp, amount: tokenAmount(amount) })
        break
      }
      default:
        break
    }
  })

  return logsData
}

// Never rejects: logs are secondary to the vesting data, so a failed or slow scan yields no logs
async function getVestingContractLogs(
  vestingAddress: string,
  provider: JsonRpcProvider,
  proposalId?: string
): Promise<ContractLog[]> {
  const scan = getContractLogs(provider, vestingAddress).catch((error) => {
    ErrorService.report('Unable to fetch vesting contract logs', {
      proposalId,
      vestingAddress,
      error: `${error}`,
      category: ErrorCategory.Vesting,
    })
    return []
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), LOGS_TIMEOUT_MS)
  })
  try {
    const logs = await Promise.race([scan, timeout])
    if (logs === null) {
      logger.log('Vesting contract logs are still loading, returning the vesting without logs', {
        proposalId,
        vestingAddress,
        timeoutMs: LOGS_TIMEOUT_MS,
      })
      return []
    }
    return logs
  } finally {
    clearTimeout(timeoutId)
  }
}

export function getInitialVestingStatus(startAt: string, finishAt: string) {
  const now = new Date()
  if (now < new Date(startAt)) {
    return VestingStatus.Pending
  }
  if (now < new Date(finishAt)) {
    return VestingStatus.InProgress
  }
  return VestingStatus.Finished
}

async function getVestingContractDataV1(
  vestingAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<Omit<Vesting, 'logs' | 'address'>> {
  const vestingContract = new ethers.Contract(vestingAddress, VESTING_ABI, provider)
  const contractStart = Number(await vestingContract.start())
  const contractDuration = Number(await vestingContract.duration())
  const contractCliff = Number(await vestingContract.cliff())
  const contractEndsTimestamp = contractStart + contractDuration
  const start_at = toISOString(contractStart)
  const finish_at = toISOString(contractEndsTimestamp)

  let status = getInitialVestingStatus(start_at, finish_at)
  const isRevoked = await vestingContract.revoked()
  if (isRevoked) {
    status = VestingStatus.Revoked
  }

  const released = parseContractValue(await vestingContract.released())
  const releasable = parseContractValue(await vestingContract.releasableAmount())

  const tokenContractAddress = await vestingContract.token()
  const tokenContract = new ethers.Contract(tokenContractAddress, ERC20_ABI, provider)
  const total = parseContractValue(await tokenContract.balanceOf(vestingAddress)) + released
  const token = getTokenSymbolFromAddress(tokenContractAddress.toLowerCase())

  return {
    cliff: toISOString(contractCliff),
    vestedPerPeriod: [],
    ...getVestingDates(contractStart, contractEndsTimestamp),
    vested: released + releasable,
    released,
    releasable,
    total,
    token,
    status,
    start_at,
    finish_at,
  }
}

async function getVestingContractDataV2(
  vestingAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<Omit<Vesting, 'logs' | 'address'>> {
  const vestingContract = new ethers.Contract(vestingAddress, VESTING_V2_ABI, provider)
  const contractStart = Number(await vestingContract.getStart())
  const contractDuration = Number(await vestingContract.getPeriod())
  const contractCliff = Number(await vestingContract.getCliff()) + contractStart

  let contractEndsTimestamp = 0
  const start_at = toISOString(contractStart)
  let finish_at = ''
  if (await vestingContract.getIsLinear()) {
    contractEndsTimestamp = contractStart + contractDuration
    finish_at = toISOString(contractEndsTimestamp)
  } else {
    const periods = (await vestingContract.getVestedPerPeriod()).length || 0
    contractEndsTimestamp = contractStart + contractDuration * periods
    finish_at = toISOString(contractEndsTimestamp)
  }

  const vestedPerPeriod = ((await vestingContract.getVestedPerPeriod()) ?? []).map(parseContractValue)

  const released = parseContractValue(await vestingContract.getReleased())
  const releasable = parseContractValue(await vestingContract.getReleasable())
  const total = parseContractValue(await vestingContract.getTotal())

  let status = getInitialVestingStatus(start_at, finish_at)
  const isRevoked = await vestingContract.getIsRevoked()
  if (isRevoked) {
    status = VestingStatus.Revoked
  } else {
    const isPaused = await vestingContract.paused()
    if (isPaused) {
      status = VestingStatus.Paused
    }
  }

  const tokenContractAddress: string = (await vestingContract.getToken()).toLowerCase()
  const token = getTokenSymbolFromAddress(tokenContractAddress)

  return {
    cliff: toISOString(contractCliff),
    vestedPerPeriod: vestedPerPeriod,
    ...getVestingDates(contractStart, contractEndsTimestamp),
    vested: released + releasable,
    released,
    releasable,
    total,
    token,
    status,
    start_at,
    finish_at,
  }
}

export function sortByTimestamp(a: VestingLog, b: VestingLog) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
}

// `includeLogs: false` is for callers that only need the vesting data (status, dates, amounts): it skips the logs
export async function getVestingWithLogsFromAlchemy(
  vestingAddress: string,
  proposalId?: string | undefined,
  includeLogs = true
) {
  const provider = new ethers.providers.JsonRpcProvider(RpcService.getRpcUrl(ChainId.ETHEREUM_MAINNET))
  let data: Omit<Vesting, 'logs' | 'address'>
  let version: ContractVersion
  try {
    data = await getVestingContractDataV2(vestingAddress, provider)
    version = ContractVersion.V2
  } catch (errorV2) {
    try {
      data = await getVestingContractDataV1(vestingAddress, provider)
      version = ContractVersion.V1
    } catch (errorV1) {
      ErrorService.report('Unable to fetch vesting contract data from alchemy', {
        proposalId,
        errorV2: `${errorV2}`,
        errorV1: `${errorV1}`,
        category: ErrorCategory.Vesting,
      })
      throw errorV1
    }
  }

  // Logs are only fetched for an address that answered a vesting data call. Both contract versions emit their logs
  // at the same address, so they are fetched once and decoded with the topics of the version that answered.
  const logs = includeLogs
    ? decodeVestingLogs(await getVestingContractLogs(vestingAddress, provider, proposalId), version)
    : []
  return {
    ...data,
    logs: logs.sort(sortByTimestamp),
    address: vestingAddress,
  }
}

export function getTokenSymbolFromAddress(tokenAddress: string) {
  switch (tokenAddress) {
    case '0x0f5d2fb29fb7d3cfee444a200298f468908cc942':
      return 'MANA'
    case '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0':
      return 'MATIC'
    case '0x6b175474e89094c44da98b954eedeac495271d0f':
      return 'DAI'
    case '0xdac17f958d2ee523a2206206994597c13d831ec7':
      return 'USDT'
    case '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
      return 'USDC'
    case '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2':
      return 'WETH'
    default:
      console.log(`Unable to parse token contract address: ${tokenAddress}`)
      return 'ETH'
  }
}
