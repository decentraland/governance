import { Contract } from '@ethersproject/contracts'
import { abi as BadgesAbi } from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ethers } from 'ethers'

import RpcService from '../../services/RpcService'
import { OTTERSPACE_DAO_RAFT_ID } from '../Snapshot/constants'

import { GAS_MULTIPLIER, GasConfig } from './types'

const RAFT_OWNER_PK = process.env.RAFT_OWNER_PK || ''
const POLYGON_BADGES_CONTRACT_ADDRESS = process.env.POLYGON_BADGES_CONTRACT_ADDRESS || ''

function checksumAddresses(addresses: string[]): string[] {
  return addresses.map((address) => ethers.utils.getAddress(address))
}

export async function estimateGas(
  contract: Contract,
  estimateFunction: (...args: any[]) => Promise<any>
): Promise<GasConfig> {
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
    const gasConfig = await estimateGas(contract, async () =>
      contract.estimateGas.airdrop(formattedRecipients, ipfsAddress)
    )
    txn = await contract.connect(raftOwner).airdrop(formattedRecipients, ipfsAddress, gasConfig)
  } else {
    txn = await contract.connect(raftOwner).airdrop(formattedRecipients, ipfsAddress)
  }
  await txn.wait()
  logger.log('Airdropped badge with txn hash:', txn.hash)
}

export async function revokeBadge(badgeId: string, reason: number) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)
  const trimmedOtterspaceId = trimOtterspaceId(OTTERSPACE_DAO_RAFT_ID)

  const gasConfig = await estimateGas(contract, async () => {
    return contract.estimateGas.revokeBadge(trimmedOtterspaceId, badgeId, reason)
  })

  const txn = await contract.connect(raftOwner).revokeBadge(trimmedOtterspaceId, badgeId, reason, gasConfig)
  await txn.wait()
  return `Revoked badge with txn hash: ${txn.hash}`
}

export async function checkBalance() {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = await new ethers.Wallet(RAFT_OWNER_PK, provider)
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
