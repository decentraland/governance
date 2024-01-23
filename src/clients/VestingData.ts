import { ChainId } from '@dcl/schemas'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import RpcService from '../services/RpcService'
import VESTING_ABI from '../utils/contracts/abi/vesting/vesting.json'
import VESTING_V2_ABI from '../utils/contracts/abi/vesting/vesting_v2.json'
import { ContractVersion, TopicsByVersion } from '../utils/contracts/vesting'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorClient } from './ErrorClient'

export type VestingDates = {
  vestingStartAt: string
  vestingFinishAt: string
}

export type VestingLog = {
  topic: string
  timestamp: string
  amount?: number
}

export type VestingInfo = VestingDates & {
  address: string
  logs: VestingLog[]
}

function toISOString(seconds: number) {
  return new Date(seconds * 1000).toISOString()
}

function getVestingDates(contractStart: number, contractEndsTimestamp: number) {
  const vestingStartAt = toISOString(contractStart)
  const vestingFinishAt = toISOString(contractEndsTimestamp)
  return {
    vestingStartAt,
    vestingFinishAt,
  }
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

async function getVestingContractDataV1(
  vestingAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<VestingDates> {
  const vestingContract = new ethers.Contract(vestingAddress, VESTING_ABI, provider)
  const contractStart = Number(await vestingContract.start())
  const contractDuration = Number(await vestingContract.duration())
  const contractEndsTimestamp = contractStart + contractDuration

  return getVestingDates(contractStart, contractEndsTimestamp)
}

async function getVestingContractDataV2(
  vestingAddress: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<VestingDates> {
  const vestingContract = new ethers.Contract(vestingAddress, VESTING_V2_ABI, provider)
  const contractStart = Number(await vestingContract.getStart())
  const contractDuration = Number(await vestingContract.getPeriod())
  let contractEndsTimestamp = 0

  if (await vestingContract.getIsLinear()) {
    contractEndsTimestamp = contractStart + contractDuration
  } else {
    const periods = (await vestingContract.getVestedPerPeriod()).length || 0
    contractEndsTimestamp = contractStart + contractDuration * periods
  }

  return getVestingDates(contractStart, contractEndsTimestamp)
}

export async function getVestingContractData(
  vestingAddress: string | null | undefined,
  proposalId?: string
): Promise<VestingInfo> {
  if (!vestingAddress || vestingAddress.length === 0) {
    throw new Error('Unable to fetch vesting data for empty contract address')
  }

  const provider = new ethers.providers.JsonRpcProvider(RpcService.getRpcUrl(ChainId.ETHEREUM_MAINNET))

  try {
    const datesPromise = getVestingContractDataV2(vestingAddress, provider)
    const logsPromise = getVestingContractLogs(vestingAddress, provider, ContractVersion.V2)
    const [dates, logs] = await Promise.all([datesPromise, logsPromise])
    return {
      ...dates,
      logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      address: vestingAddress,
    }
  } catch (errorV2) {
    try {
      const datesPromise = getVestingContractDataV1(vestingAddress, provider)
      const logsPromise = getVestingContractLogs(vestingAddress, provider, ContractVersion.V1)
      const [dates, logs] = await Promise.all([datesPromise, logsPromise])
      return {
        ...dates,
        logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        address: vestingAddress,
      }
    } catch (errorV1) {
      ErrorClient.report('Unable to fetch vesting contract data', {
        proposalId,
        error: errorV1,
        category: ErrorCategory.Vesting,
      })
      throw errorV1
    }
  }
}
