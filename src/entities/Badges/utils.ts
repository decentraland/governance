import { Contract } from '@ethersproject/contracts'
import { abi as BadgesAbi } from '@otterspace-xyz/contracts/out/Badges.sol/Badges.json'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'
import { ethers } from 'ethers'
import { NFTStorage } from 'nft.storage'

import {
  NFT_STORAGE_API_KEY,
  POLYGON_BADGES_CONTRACT_ADDRESS,
  POLYGON_RAFTS_CONTRACT_ADDRESS,
  RAFT_OWNER_PK,
  TRIMMED_OTTERSPACE_RAFT_ID,
} from '../../constants'
import { ErrorService } from '../../services/ErrorService'
import RpcService from '../../services/RpcService'
import { ErrorCategory } from '../../utils/errorCategories'

import { GAS_MULTIPLIER, GasConfig } from './types'

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

export async function reinstateBadge(badgeId: string) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)
  const gasConfig = await estimateGas(contract, async () => {
    return contract.estimateGas.reinstateBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId)
  })

  const txn = await contract.connect(raftOwner).reinstateBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, gasConfig)
  await txn.wait()
  return `Reinstated badge with txn hash: ${txn.hash}`
}

export async function revokeBadge(badgeId: string, reason: number) {
  const provider = RpcService.getPolygonProvider()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)

  const gasConfig = await estimateGas(contract, async () => {
    return contract.estimateGas.revokeBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, reason)
  })

  const txn = await contract.connect(raftOwner).revokeBadge(TRIMMED_OTTERSPACE_RAFT_ID, badgeId, reason, gasConfig)
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

export async function getLandOwnerAddresses(): Promise<string[]> {
  const LAND_API_URL = 'https://api.decentraland.org/v2/tiles?include=owner&type=owned'
  type LandOwner = { owner: string }
  try {
    const response: ApiResponse<{ [coordinates: string]: LandOwner }> = await (await fetch(LAND_API_URL)).json()
    const { data: landOwnersMap } = response
    const landOwnersAddresses = new Set(Object.values(landOwnersMap).map((landOwner) => landOwner.owner.toLowerCase()))
    return Array.from(landOwnersAddresses)
  } catch (error) {
    ErrorService.report("Couldn't fetch land owners", { error, category: ErrorCategory.Badges })
    return []
  }
}

const blobToFile = (theBlob: Blob, fileName: string): File => {
  const b: any = theBlob
  b.lastModifiedDate = new Date()
  b.name = fileName
  return b as File
}

function getImageInfoFromUrl(url: string): { imageName: string; extension: string } {
  const urlParts = url.split('/')
  const rawFileName = urlParts[urlParts.length - 1].split('?')[0]
  const [imageName, extension] = rawFileName.split('.')
  return { imageName, extension }
}

const fetchImageAndCreateFile = async (imgUrl: string) => {
  console.log('imgUrl', imgUrl)
  const { imageName, extension } = getImageInfoFromUrl(imgUrl)

  try {
    const response = await fetch(imgUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }
    const imageBlob = await response.blob()
    const file = blobToFile(imageBlob, `${imageName}.${extension}`)
    return file
  } catch (error) {
    console.error('Error fetching image:', error)
    throw error
  }
}

export async function storeBadgeSpec(title: string, description: string, imgUrl: string, expiresAt?: string) {
  const client = new NFTStorage({ token: NFT_STORAGE_API_KEY })
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK)
  const file = await fetchImageAndCreateFile(imgUrl)

  const badgeSpec = {
    schema: 'https://api.otterspace.xyz/schemas/badge/1.0.1.json',
    name: title,
    description: description,
    properties: {
      raftTokenId: TRIMMED_OTTERSPACE_RAFT_ID,
      raftContractAddress: POLYGON_RAFTS_CONTRACT_ADDRESS,
      createdByAddress: raftOwner.address,
      expiresAt: expiresAt ? expiresAt : null,
    },
    image: file,
  }

  const metadata = await client.store(badgeSpec)

  const cid = metadata.ipnft

  const metadataUrl = `https://ipfs.io/ipfs/${cid}/metadata.json`
  const ipfsAddress = `ipfs://${cid}/metadata.json`
  return { badgeCid: cid, metadataUrl, ipfsAddress }
}
