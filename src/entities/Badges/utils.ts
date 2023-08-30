import { abi as BadgesAbi } from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'
import { ethers } from 'ethers'

import { ErrorClient } from '../../clients/ErrorClient'
import { OtterspaceSubgraph } from '../../clients/OtterspaceSubgraph'
import { POLYGON_BADGES_CONTRACT_ADDRESS, RAFT_OWNER_PK, TRIMMED_OTTERSPACE_RAFT_ID } from '../../constants'
import RpcService from '../../services/RpcService'
import { ErrorCategory } from '../../utils/errorCategories'
import { getUsersWhoVoted, isSameAddress } from '../Snapshot/utils'

import { BadgeStatus, BadgeStatusReason, ErrorReason, GAS_MULTIPLIER, GasConfig } from './types'

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

export async function getUsersWithoutBadge(badgeCid: string, users: string[]) {
  const badges = await OtterspaceSubgraph.get().getBadges(badgeCid)
  const usersWithBadgesToReinstate: string[] = []
  const usersWithoutBadge: string[] = []

  for (const user of users) {
    const userBadge = badges.find((badge) => isSameAddress(user, badge.owner?.id))
    if (!userBadge) {
      usersWithoutBadge.push(user)
      continue
    }
    if (userBadge.status === BadgeStatus.Revoked && userBadge.statusReason === BadgeStatusReason.TenureEnded) {
      usersWithBadgesToReinstate.push(user)
    }
  }

  return {
    usersWithoutBadge,
    usersWithBadgesToReinstate,
  }
}

type ValidatedUsers = {
  eligibleUsers: string[]
  usersWithBadgesToReinstate: string[]
  error?: string
}

export async function getValidatedUsersForBadge(badgeCid: string, addresses: string[]): Promise<ValidatedUsers> {
  try {
    const { usersWithoutBadge, usersWithBadgesToReinstate } = await getUsersWithoutBadge(badgeCid, addresses)
    const usersWhoVoted = usersWithoutBadge.length > 0 ? await getUsersWhoVoted(usersWithoutBadge) : []
    const result = {
      eligibleUsers: usersWhoVoted,
      usersWithBadgesToReinstate,
    }
    if (usersWithoutBadge.length === 0) {
      return { ...result, error: ErrorReason.NoUserWithoutBadge }
    }
    if (usersWhoVoted.length === 0) {
      return { ...result, error: ErrorReason.NoUserHasVoted }
    }
    return result
  } catch (error) {
    return { eligibleUsers: [], usersWithBadgesToReinstate: [], error: JSON.stringify(error) }
  }
}
