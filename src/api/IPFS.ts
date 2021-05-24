import API from 'decentraland-gatsby/dist/utils/api/API'
import env from 'decentraland-gatsby/dist/utils/env'

export type HashContent = {
  address: string,
  msg: string,
  sig: string,
  version: string
}

export class IPFS extends API {

  static Url = (
    process.env.GATSBY_IPFS_API ||
    process.env.REACT_APP_IPFS_API ||
    process.env.STORYBOOK_IPFS_API ||
    process.env.IPFS_API ||
    'https://ipfs.io'
  )

  static Cache = new Map<string, IPFS>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('IPFS_API', this.Url))
  }

  async getHash(hash: string): Promise<HashContent> {
    console.log(this.baseUrl + `/ipfs/${hash}`)
    return this.fetch<HashContent>(`/ipfs/${hash}`)
  }
}