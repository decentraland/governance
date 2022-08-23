import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types'
import API from 'decentraland-gatsby/dist/utils/api/API'
import env from 'decentraland-gatsby/dist/utils/env'

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

export class IPFS extends API {
  static Url = process.env.INFURA_IPFS_GATEWAY_API || 'https://cloudflare-ipfs.com'

  static Cache = new Map<string, IPFS>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('INFURA_IPFS_GATEWAY_API', this.Url))
  }

  async getHash(hash: string): Promise<HashContent> {
    const url = `/ipfs/${hash}`
    console.log(this.baseUrl + url)

    return this.fetch<HashContent>(url, this.options().method('GET'))
  }
}
