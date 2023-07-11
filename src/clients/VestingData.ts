import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import DclRpcService from '../services/DclRpcService'
import VESTING_ABI from '../utils/contracts/abi/vesting/vesting.json'
import VESTING_V2_ABI from '../utils/contracts/abi/vesting/vesting_v2.json'

import { ErrorClient } from './ErrorClient'

export type VestingDates = {
  vestingStartAt: string
  vestingFinishAt: string
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
  proposalId: string,
  vestingAddress: string | null | undefined
): Promise<VestingDates> {
  if (!vestingAddress || vestingAddress.length === 0) {
    throw new Error('Unable to fetch vesting data for empty contract address')
  }

  const web3 = new Web3(DclRpcService.getRpcUrl())
  try {
    return await getVestingContractDataV2(vestingAddress, web3)
  } catch (errorV2) {
    try {
      return await getVestingContractDataV1(vestingAddress, web3)
    } catch (errorV1) {
      ErrorClient.report('Unable to fetch vesting contract data', { proposalId, error: errorV1 })
      throw errorV1
    }
  }
}
