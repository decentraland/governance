/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract } from '@ethersproject/contracts'
import { abi as BadgesAbi } from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json'
import { BigNumber, ethers } from 'ethers'

import { POLYGON_BADGES_CONTRACT_ADDRESS, RAFT_OWNER_PK, TRIMMED_OTTERSPACE_RAFT_ID } from '../../constants'
import { ActionStatus, BadgeCreationResult, GasConfig } from '../../entities/Badges/types'
import RpcService from '../../services/RpcService'
import logger from '../../utils/logger'
import { BlockNative } from '../clients/BlockNative'
import { AirdropJobStatus, AirdropOutcome } from '../types/AirdropJob'

const TRANSACTION_UNDERPRICED_ERROR_CODE = '-32000'
const TRANSACTION_REPLACED_CODE = 'TRANSACTION_REPLACED'

function checksumAddresses(addresses: string[]): string[] {
  return addresses.map((address) => ethers.utils.getAddress(address))
}

function getBadgesSignerAndContract() {
  const provider = RpcService.getPolygonProvider()
  const signer = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, signer)
  return { signer, contract }
}

const GAS_LIMIT_PERCENTAGE_OVER_ESTIMATED = 20
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function estimateGas(estimateFunction: (...args: any[]) => Promise<any>): Promise<GasConfig> {
  const gasData = await BlockNative.getPolygonGasData()
  const estimatedGasLimit = await estimateFunction()
  const gasLimit = estimatedGasLimit.add(estimatedGasLimit.mul(GAS_LIMIT_PERCENTAGE_OVER_ESTIMATED).div(100))

  return {
    ...gasData,
    gasLimit,
  }
}

export async function airdrop(badgeCid: string, recipients: string[], gasIncrement = 0) {
  const { signer, contract } = getBadgesSignerAndContract()
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`
  const formattedRecipients = checksumAddresses(recipients)
  logger.log(`Preparing airdrop with gas increment: ${gasIncrement}`)

  const gasConfig = await getGasConfig(contract, formattedRecipients, ipfsAddress, gasIncrement)
  const txn = await contract.connect(signer).airdrop(formattedRecipients, ipfsAddress, gasConfig)
  await txn.wait()
  logger.log('Airdropped badge with txn hash:', txn.hash)
  return txn.hash
}

async function getGasConfig(
  contract: Contract,
  formattedRecipients: string[],
  ipfsAddress: string,
  gasIncrement: number
) {
  const defaultGasConfig = await estimateGas(async () => contract.estimateGas.airdrop(formattedRecipients, ipfsAddress))
  return gasIncrement > 0 ? getIncreasedGasConfig(defaultGasConfig, gasIncrement) : defaultGasConfig
}

function getIncreasedGasConfig(gasConfig: GasConfig, gasIncrement: number) {
  const incrementFactor = 100 + gasIncrement * 10

  return {
    gasLimit: BigNumber.from(gasConfig.gasLimit).mul(incrementFactor).div(100),
    maxFeePerGas: BigNumber.from(gasConfig.maxFeePerGas).mul(incrementFactor).div(100),
    maxPriorityFeePerGas: BigNumber.from(gasConfig.maxPriorityFeePerGas).mul(incrementFactor).div(100),
  }
}

export async function reinstateBadge(badgeId: string) {
  const { signer, contract } = getBadgesSignerAndContract()
  const gasConfig = await estimateGas(async () => {
    return contract.estimateGas.reinstateBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId)
  })

  const txn = await contract.connect(signer).reinstateBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, gasConfig)
  await txn.wait()
  logger.log('Reinstated badge with txn hash:', txn.hash)
  return txn.hash
}

export async function revokeBadge(badgeId: string, reason: number) {
  const { signer, contract } = getBadgesSignerAndContract()

  const gasConfig = await estimateGas(async () => {
    return contract.estimateGas.revokeBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, reason)
  })

  const txn = await contract.connect(signer).revokeBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, reason, gasConfig)
  await txn.wait()
  logger.log('Revoked badge with txn hash:', txn.hash)
  return txn.hash
}

export async function checkBalance() {
  const { signer } = getBadgesSignerAndContract()
  const balance = await signer.getBalance()
  const balanceInEther = ethers.utils.formatEther(balance)
  const balanceBigNumber = ethers.BigNumber.from(balance)
  console.log(`Balance of ${signer.address}: ${balanceInEther} ETH = ${balanceBigNumber}`)
}

export function getIpfsAddress(badgeCid: string) {
  return `ipfs://${badgeCid}/metadata.json`
}

export async function createSpec(badgeCid: string) {
  const { signer, contract } = getBadgesSignerAndContract()
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`

  const gasConfig = await estimateGas(async () => {
    return contract.estimateGas.createSpec(ipfsAddress, TRIMMED_OTTERSPACE_RAFT_ID)
  })

  const txn = await contract.connect(signer).createSpec(ipfsAddress, TRIMMED_OTTERSPACE_RAFT_ID, gasConfig)
  await txn.wait()
  logger.log('Create badge spec with txn hash:', txn.hash)
  return txn.hash
}

export async function airdropWithRetry(
  badgeCid: string,
  recipients: string[],
  retries = 3,
  gasIncrement = 0
): Promise<AirdropOutcome> {
  try {
    await airdrop(badgeCid, recipients, gasIncrement)
    return { status: AirdropJobStatus.FINISHED, error: '', recipients, badge_spec: badgeCid }
  } catch (error: any) {
    if (retries > 0) {
      if (isTransactionReplacedError(error)) {
        logger.log(`Found replacement transaction for airdrop`, error)
        if (error.receipt.status === 1) {
          return { status: AirdropJobStatus.FINISHED, error: JSON.stringify(error), recipients, badge_spec: badgeCid }
        }
      }
      logger.log(`Retrying airdrop... Attempts left: ${retries}`, error)
      let newGasIncrement = gasIncrement
      if (isTransactionUnderpricedError(error)) {
        newGasIncrement += 1
      }
      return await airdropWithRetry(badgeCid, recipients, retries - 1, newGasIncrement)
    } else {
      logger.error('Airdrop failed after maximum retries', error)
      return { status: AirdropJobStatus.FAILED, error: JSON.stringify(error), recipients, badge_spec: badgeCid }
    }
  }
}

export async function createSpecWithRetry(badgeCid: string, retries = 3): Promise<BadgeCreationResult> {
  try {
    await createSpec(badgeCid)
    return { status: ActionStatus.Success, badgeCid }
  } catch (error: any) {
    if (retries > 0) {
      logger.log(`Retrying create spec... Attempts left: ${retries}`, error)
      return await createSpecWithRetry(badgeCid, retries - 1)
    } else {
      logger.error('Create spec failed after maximum retries', error)
      return { status: ActionStatus.Failed, error, badgeCid }
    }
  }
}

export function isTransactionUnderpricedError(error: any): boolean {
  const checkError = (err: any): boolean => {
    if (!err) return false
    if (
      err.code === 'REPLACEMENT_UNDERPRICED' ||
      err.code === TRANSACTION_UNDERPRICED_ERROR_CODE ||
      String(err.error?.error?.code) === TRANSACTION_UNDERPRICED_ERROR_CODE ||
      err.reason === 'replacement fee too low'
    ) {
      return true
    }
    if (err.error) {
      return checkError(err.error)
    }
    return false
  }

  return checkError(error)
}

export function isTransactionReplacedError(error: any): boolean {
  const checkError = (err: any): boolean => {
    if (!err) return false

    if (err.code === TRANSACTION_REPLACED_CODE || err.reason === 'replaced') {
      return true
    }

    if (err.error) {
      return checkError(err.error)
    }

    return false
  }

  return checkError(error)
}
