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

async function getVestingContractLogs(vestingAddress: string, provider: JsonRpcProvider, version: ContractVersion) {
  const logs = await provider.getLogs({
    address: vestingAddress,
    fromBlock: 13916992, // 01/01/2022
    toBlock: 'latest',
  })

  const blocks = await Promise.all(logs.map((log) => provider.getBlock(log.blockNumber)))

  const topics = TopicsByVersion[version]
  const logsData: VestingLog[] = []

  logs.forEach((log, idx) => {
    const eventTimestamp = Number(blocks[idx].timestamp)
    const amount = parseInt(log.data, 16) / 1e18
    switch (log.topics[0]) {
      case topics.REVOKE:
        logsData.push({ topic: topics.REVOKE, timestamp: toISOString(eventTimestamp) })
        break
      case topics.PAUSED:
        logsData.push({ topic: topics.PAUSED, timestamp: toISOString(eventTimestamp) })
        break
      case topics.UNPAUSED:
        logsData.push({ topic: topics.UNPAUSED, timestamp: toISOString(eventTimestamp) })
        break
      case topics.RELEASE:
        logsData.push({ topic: topics.RELEASE, timestamp: toISOString(eventTimestamp), amount })
        break
      default:
        break
    }
  })

  return logsData
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

export async function getVestingWithLogsFromAlchemy(vestingAddress: string, proposalId?: string | undefined) {
  const provider = new ethers.providers.JsonRpcProvider(RpcService.getRpcUrl(ChainId.ETHEREUM_MAINNET))

  try {
    const dataPromise = getVestingContractDataV2(vestingAddress, provider)
    const logsPromise = getVestingContractLogs(vestingAddress, provider, ContractVersion.V2)
    const [data, logs] = await Promise.all([dataPromise, logsPromise])
    return {
      ...data,
      logs: logs.sort(sortByTimestamp),
      address: vestingAddress,
    }
  } catch (errorV2) {
    try {
      const dataPromise = getVestingContractDataV1(vestingAddress, provider)
      const logsPromise = getVestingContractLogs(vestingAddress, provider, ContractVersion.V1)
      const [data, logs] = await Promise.all([dataPromise, logsPromise])
      return {
        ...data,
        logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        address: vestingAddress,
      }
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
