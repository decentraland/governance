import { abi as BadgesAbi } from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'
import { ethers } from 'ethers'

import { ErrorClient } from '../../clients/ErrorClient'
import { POLYGON_BADGES_CONTRACT_ADDRESS, RAFT_OWNER_PK, TRIMMED_OTTERSPACE_RAFT_ID } from '../../constants'
import RpcService from '../../services/RpcService'
import Time from '../../utils/date/Time'
import { ErrorCategory } from '../../utils/errorCategories'

import { GAS_MULTIPLIER, GasConfig } from './types'

function checksumAddresses(addresses: string[]): string[] {
  return addresses.map((address) => ethers.utils.getAddress(address))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function estimateGas(estimateFunction: (...args: any[]) => Promise<any>): Promise<GasConfig> {
  const provider = RpcService.getPolygonProvider()
  const gasLimit = await estimateFunction()
  const gasPrice = await provider.getGasPrice()
  const adjustedGasPrice = gasPrice.mul(GAS_MULTIPLIER)
  return {
    gasPrice: adjustedGasPrice,
    gasLimit,
  }
}

export async function airdrop(badgeCid: string, recipients: string[], pumpGas = false) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`
  const formattedRecipients = checksumAddresses(recipients)
  logger.log(`Airdropping, pumping gas ${pumpGas}`)
  let txn
  if (pumpGas) {
    const gasConfig = await estimateGas(async () => contract.estimateGas.airdrop(formattedRecipients, ipfsAddress))
    txn = await contract.connect(raftOwner).airdrop(formattedRecipients, ipfsAddress, gasConfig)
  } else {
    txn = await contract.connect(raftOwner).airdrop(formattedRecipients, ipfsAddress)
  }
  await txn.wait()
  logger.log('Airdropped badge with txn hash:', txn.hash)
  return txn.hash
}

export async function reinstateBadge(badgeId: string) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)
  const gasConfig = await estimateGas(async () => {
    return contract.estimateGas.reinstateBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId)
  })

  const txn = await contract.connect(raftOwner).reinstateBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, gasConfig)
  await txn.wait()
  logger.log('Reinstated badge with txn hash:', txn.hash)
  return txn.hash
}

export async function revokeBadge(badgeId: string, reason: number) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)

  const gasConfig = await estimateGas(async () => {
    return contract.estimateGas.revokeBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, reason)
  })

  const txn = await contract.connect(raftOwner).revokeBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, reason, gasConfig)
  await txn.wait()
  logger.log('Revoked badge with txn hash:', txn.hash)
  return txn.hash
}

export async function checkBalance() {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const balance = await raftOwner.getBalance()
  const balanceInEther = ethers.utils.formatEther(balance)
  const balanceBigNumber = ethers.BigNumber.from(balance)
  console.log(`Balance of ${raftOwner.address}: ${balanceInEther} ETH = ${balanceBigNumber}`)
}

export function trimOtterspaceId(rawId: string) {
  const parts = rawId.split(':')
  if (parts.length === 2) {
    return parts[1]
  }
  return ''
}

export function getIpfsAddress(badgeCid: string) {
  return `ipfs://${badgeCid}/metadata.json`
}

export async function createSpec(badgeCid: string) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`

  const gasConfig = await estimateGas(async () => {
    return contract.estimateGas.createSpec(ipfsAddress, TRIMMED_OTTERSPACE_RAFT_ID)
  })

  const txn = await contract.connect(raftOwner).createSpec(ipfsAddress, TRIMMED_OTTERSPACE_RAFT_ID, gasConfig)
  await txn.wait()
  logger.log('Create badge spec with txn hash:', txn.hash)
  return txn.hash
}

// TODO: separate utils for DAO badges from utils for contract interactions

export async function getLandOwnerAddresses(): Promise<string[]> {
  const LAND_API_URL = 'https://api.decentraland.org/v2/tiles?include=owner&type=owned'
  type LandOwner = { owner: string }
  try {
    const response: ApiResponse<{ [coordinates: string]: LandOwner }> = await (await fetch(LAND_API_URL)).json()
    const { data: landOwnersMap } = response
    const landOwnersAddresses = new Set(Object.values(landOwnersMap).map((landOwner) => landOwner.owner.toLowerCase()))
    return Array.from(landOwnersAddresses)
  } catch (error) {
    ErrorClient.report("Couldn't fetch land owners", { error, category: ErrorCategory.Badges })
    return []
  }
}

export function getTopVoterBadgeTitle(start: Date) {
  const startTime = Time.utc(start)
  return `Top Voter ${startTime.format('MMMM')} ${startTime.format('YYYY')}`
}
