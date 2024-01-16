import { ethers } from 'ethers'
import { NFTStorage } from 'nft.storage'

import { getIpfsAddress } from '../../back/utils/contractInteractions'
import {
  NFT_STORAGE_API_KEY,
  POLYGON_RAFTS_CONTRACT_ADDRESS,
  RAFT_OWNER_PK,
  TRIMMED_OTTERSPACE_RAFT_ID,
} from '../../constants'
import { toIsoStringDate } from '../../utils/date/toIsoString'
import logger from '../../utils/logger'

import { ActionStatus, BadgeCreationResult } from './types'

const blobToFile = (theBlob: Blob, fileName: string): File => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const getImageFileFromUrl = async (imgUrl: string) => {
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

interface BadgeSpec {
  title: string
  description: string
  imgUrl: string
  expiresAt?: string
}

export async function storeBadgeSpec({ title, description, imgUrl, expiresAt }: BadgeSpec) {
  const client = new NFTStorage({ token: NFT_STORAGE_API_KEY })
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK)
  const file = await getImageFileFromUrl(imgUrl)

  const badgeSpec = {
    schema: 'https://api.otterspace.xyz/schemas/badge/1.0.1.json',
    name: title,
    description: description,
    properties: {
      raftTokenId: TRIMMED_OTTERSPACE_RAFT_ID,
      raftContractAddress: POLYGON_RAFTS_CONTRACT_ADDRESS,
      createdByAddress: raftOwner.address,
      expiresAt: expiresAt ? toIsoStringDate(expiresAt) : '',
    },
    image: file,
  }

  const metadata = await client.store(badgeSpec)
  const badgeCid = metadata.ipnft

  const metadataUrl = `https://ipfs.io/ipfs/${badgeCid}/metadata.json`
  const ipfsAddress = getIpfsAddress(badgeCid)
  return { badgeCid: badgeCid, metadataUrl, ipfsAddress }
}

export async function storeBadgeSpecWithRetry(badgeSpec: BadgeSpec, retries = 3): Promise<BadgeCreationResult> {
  const badgeTitle = badgeSpec.title
  try {
    const { badgeCid } = await storeBadgeSpec(badgeSpec)
    return { status: ActionStatus.Success, badgeCid, badgeTitle }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (retries > 0) {
      logger.log(`Retrying upload spec... Attempts left: ${retries}`, error)
      return await storeBadgeSpecWithRetry(badgeSpec, retries - 1)
    } else {
      logger.error('Upload spec failed after maximum retries', error)
      return { status: ActionStatus.Failed, error, badgeTitle }
    }
  }
}
