import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types'
import { create } from 'ipfs-http-client'

export type HashContent = {
  address: string
  sig: string
  data: {
    domain: {
      name: string
      version: string
    }
    types: { Proposal: [] }
    message: Proposal
  }
}

const projectId = process.env.INFURA_IPFS_PROJECT_ID
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
})

export class InfuraIPFS {
  static async cat(hash: string): Promise<HashContent> {
    const items = []
    for await (const data of client.cat(hash)) {
      items.push(data)
    }

    return JSON.parse(items.toString())
  }
}
