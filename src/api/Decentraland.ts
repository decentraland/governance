import API from 'decentraland-gatsby/dist/utils/api/API'

export class Decentraland extends API {

  static Url = (
    process.env.GATSBY_DECENTRALAND_API ||
    'https://decentraland.org'
  )

  static Cache = new Map<string, Decentraland>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(this.Url)
  }

  async subscribe(email: string){
    return this.fetch(
      '/subscribe',
      this.options()
        .method('POST')
        .json({ email, list: "governance"})
    )
  }
}
