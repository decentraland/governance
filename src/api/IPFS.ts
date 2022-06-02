import API from 'decentraland-gatsby/dist/utils/api/API'
import env from 'decentraland-gatsby/dist/utils/env'

export type HashContent = {
  address: string
  msg: string
  sig: string
  version: string
}

export class IPFS extends API {
  // TODO: Public Infura IPFS gateway will be deprecated by October 5th, 2022. Use dedicated gateway.
  static Url = process.env.INFURA_IPFS_GATEWAY_API || 'https://ipfs.infura.io:5001/api/v0'

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
    const url = `/cat?arg=${hash}`
    console.log(this.baseUrl + url)
    return this.fetch<HashContent>(url, this.options().method('POST'))
  }
}
