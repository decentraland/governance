import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import DclRpcService from '../services/DclRpcService'
import { ContractVersion, TopicsByVersion } from '../utils/contracts'
import VESTING_ABI from '../utils/contracts/abi/vesting/vesting.json'
import VESTING_V2_ABI from '../utils/contracts/abi/vesting/vesting_v2.json'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorClient } from './ErrorClient'

export type VestingDates = {
  vestingStartAt: string
  vestingFinishAt: string
}

export type VestingLog = {
  topic: string
  timestamp: string
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

async function getVestingContractLogs(vestingAddress: string, web3: Web3, version: ContractVersion) {
  const eth = web3.eth
  const web3Logs = await eth.getPastLogs({
    address: vestingAddress,
    fromBlock: 0,
    toBlock: 'latest',
  })

  const blocks = await Promise.all(web3Logs.map((log) => eth.getBlock(log.blockNumber)))
  const logs: VestingLog[] = []
  const topics = TopicsByVersion[version]

  const getLog = (timestamp: number, topic: string): VestingLog => ({
    topic,
    timestamp: toISOString(timestamp),
  })

  for (const idx in web3Logs) {
    switch (web3Logs[idx].topics[0]) {
      case topics.REVOKE:
        logs.push(getLog(Number(blocks[idx].timestamp), topics.REVOKE))
        break
      case topics.PAUSED:
        logs.push(getLog(Number(blocks[idx].timestamp), topics.PAUSED))
        break
      case topics.UNPAUSED:
        logs.push(getLog(Number(blocks[idx].timestamp), topics.UNPAUSED))
        break
      default:
        break
    }
  }

  return logs
}

async function getVestingContractDataV1(vestingAddress: string, web3: Web3): Promise<VestingDates> {
  const vestingContract = new web3.eth.Contract(VESTING_ABI as AbiItem[], vestingAddress)
  const contractStart = Number(await vestingContract.methods.start().call())
  const contractDuration = Number(await vestingContract.methods.duration().call())
  const contractEndsTimestamp = contractStart + contractDuration

  return getVestingDates(contractStart, contractEndsTimestamp)
}

async function getVestingContractDataV2(vestingAddress: string, web3: Web3): Promise<VestingDates> {
  const vestingContract = new web3.eth.Contract(VESTING_V2_ABI as AbiItem[], vestingAddress)
  const contractStart = Number(await vestingContract.methods.getStart().call())
  const contractDuration = Number(await vestingContract.methods.getPeriod().call())
  let contractEndsTimestamp = 0
  if (await vestingContract.methods.getIsLinear().call()) {
    contractEndsTimestamp = contractStart + contractDuration
  } else {
    const periods = (await vestingContract.methods.getVestedPerPeriod().call()).length || 0
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

  const web3 = new Web3(DclRpcService.getRpcUrl())
  try {
    const datesPromise = getVestingContractDataV2(vestingAddress, web3)
    const logsPromise = getVestingContractLogs(vestingAddress, web3, ContractVersion.V2)
    const [dates, logs] = await Promise.all([datesPromise, logsPromise])
    return {
      ...dates,
      logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      address: vestingAddress,
    }
  } catch (errorV2) {
    try {
      const datesPromise = getVestingContractDataV1(vestingAddress, web3)
      const logsPromise = getVestingContractLogs(vestingAddress, web3, ContractVersion.V1)
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
