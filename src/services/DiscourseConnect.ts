import { constants, generateKeyPairSync, privateDecrypt } from 'crypto'
import { hostname } from 'os'

import { FORUM_URL, GOVERNANCE_API } from '../constants'

const APP_NAME = GOVERNANCE_API.replace(/\/api/, '')
export class DiscourseConnect {
  private privateKey: string
  private url: string

  constructor(redirectUrl: string) {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    })
    this.privateKey = privateKey

    const forumUrl = FORUM_URL.endsWith('/') ? FORUM_URL.slice(0, -1) : FORUM_URL
    const url = new URL(`${forumUrl}/user-api-key/new`)

    url.searchParams.append('auth_redirect', redirectUrl)
    url.searchParams.append('application_name', APP_NAME)
    url.searchParams.append('client_id', hostname())
    url.searchParams.append('scopes', 'write')
    url.searchParams.append('public_key', publicKey)
    url.searchParams.append('nonce', '1')

    this.url = url.href
  }

  getUrl() {
    return this.url
  }

  getUserApiKey(encodedKey: string): string {
    const trim = encodedKey.trim().replace(/\s/g, '')
    const decodedKey = privateDecrypt(
      {
        key: this.privateKey,
        padding: constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(trim, 'base64')
    )
    const json = decodedKey.toString('ascii')

    return JSON.parse(json).key
  }
}
