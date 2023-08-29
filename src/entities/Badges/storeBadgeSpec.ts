import { ethers } from 'ethers'
import { NFTStorage } from 'nft.storage'

import {
  NFT_STORAGE_API_KEY,
  POLYGON_RAFTS_CONTRACT_ADDRESS,
  RAFT_OWNER_PK,
  TRIMMED_OTTERSPACE_RAFT_ID,
} from '../../constants'

import { getIpfsAddress } from './utils'

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

function convertToISODate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  const isoDateString = `${year}-${month}-${day}T00:00:00.000Z`
  return isoDateString
}

export async function storeBadgeSpec(title: string, description: string, imgUrl: string, expiresAt?: string) {
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
      expiresAt: expiresAt ? convertToISODate(expiresAt) : '',
    },
    image: file,
  }

  const metadata = await client.store(badgeSpec)
  const badgeCid = metadata.ipnft

  const metadataUrl = `https://ipfs.io/ipfs/${badgeCid}/metadata.json`
  const ipfsAddress = getIpfsAddress(badgeCid)
  return { badgeCid: badgeCid, metadataUrl, ipfsAddress }
}
