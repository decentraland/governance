import Web3 from 'web3'

import VESTING_ABI from '../abi/vesting.json'
import VESTING_V2_ABI from '../abi/vesting_v2.json'
import { ErrorService } from '../services/ErrorService'

export type VestingDates = {
  vestingStartAt: string
  vestingFinishAt: string
  durationInMonths: number
}

const INFURA_URL = 'https://mainnet.infura.io/v3/5adeba77a95044dbadacb8e9229a2050'
// export const INFURA_URL = process.env.INFURA_URL
const web3 = new Web3(INFURA_URL)

function toISOString(seconds: number) {
  return new Date(seconds * 1000).toISOString()
}

function getMonthsBetweenDates(startDate: Date, endDate: Date) {
  try {
    const yearDiff = endDate.getFullYear() - startDate.getFullYear()
    const monthDiff = endDate.getMonth() - startDate.getMonth()
    return yearDiff * 12 + monthDiff
  } catch (error) {
    throw new Error(`startDate: ${startDate}, endDate: ${endDate}. ${error}`)
  }
}

async function _getVestingContractDataV1(vestingAddress: string): Promise<VestingDates> {
  const vestingContract = new web3.eth.Contract(VESTING_ABI, vestingAddress)
  const contractStart: number = await vestingContract.methods.start().call()
  const contractDuration: number = await vestingContract.methods.duration().call()
  const contractEndsTimestamp = Number(contractStart) + Number(contractDuration)
  const vestingStartAt = toISOString(Number(contractStart))
  const vestingFinishAt = toISOString(Number(contractEndsTimestamp))
  const result = {
    vestingStartAt,
    vestingFinishAt,
    durationInMonths: getMonthsBetweenDates(new Date(vestingStartAt), new Date(vestingFinishAt)),
  }
  return result
}

async function _getVestingContractDataV2(vestingAddress: string): Promise<VestingDates> {
  const vestingContract = new web3.eth.Contract(VESTING_V2_ABI, vestingAddress)
  const contractStart: number = await vestingContract.methods.getStart().call()
  const contractDuration: number = await vestingContract.methods.getPeriod().call()
  const contractEndsTimestamp = Number(contractStart) + Number(contractDuration)
  const vestingStartAt = toISOString(Number(contractStart))
  const vestingFinishAt = toISOString(Number(contractEndsTimestamp))

  return {
    vestingStartAt,
    vestingFinishAt,
    durationInMonths: getMonthsBetweenDates(new Date(vestingStartAt), new Date(vestingFinishAt)),
  }
}

export async function getVestingContractData(
  proposalId: string,
  vestingAddress: string
): Promise<VestingDates | undefined> {
  try {
    return await _getVestingContractDataV1(vestingAddress)
  } catch (errorV1) {
    try {
      return await _getVestingContractDataV2(vestingAddress)
    } catch (errorV2) {
      ErrorService.report(
        `Error trying to get vesting data for proposal ${proposalId}, vesting address ${vestingAddress}`,
        `Error V1: ${errorV1}, Error V2: ${errorV2}`
      )
    }
  }
}
