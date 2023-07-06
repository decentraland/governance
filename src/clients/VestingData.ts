import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import { ErrorService } from '../services/ErrorService'
import VESTING_ABI from '../utils/contracts/abi/vesting/vesting.json'
import VESTING_V2_ABI from '../utils/contracts/abi/vesting/vesting_v2.json'

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
  const vestingContract = new web3.eth.Contract(VESTING_ABI as AbiItem[], vestingAddress)
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
  const vestingContract = new web3.eth.Contract(VESTING_V2_ABI as AbiItem[], vestingAddress)
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
  vestingAddress: string | null | undefined
): Promise<VestingDates> {
  if (vestingAddress && vestingAddress.length > 0) {
    try {
      return await _getVestingContractDataV1(vestingAddress)
    } catch (errorV1) {
      try {
        return await _getVestingContractDataV2(vestingAddress)
      } catch (errorV2) {
        ErrorService.report('Unable to fetch vesting contract data', { proposalId: proposalId })
      }
    }
  }
  throw new Error('Unable to fetch vesting contract data')
}
