import { hostname } from 'os'

import { FORUM_URL, GOVERNANCE_API } from '../constants'
import { decrypt, generateAsymmetricKeys } from '../helpers'

const APP_NAME = GOVERNANCE_API.replace(/\/api/, '')

function generateNonce() {
  const DIGITS_AMOUNT = 6
  const randomNum = Math.round(Math.random() * Math.pow(10, DIGITS_AMOUNT))
  return randomNum.toString().padStart(DIGITS_AMOUNT, '0')
}
export class DiscourseConnect {
  private privateKey: string
  private nonce: string
  private url: string

  constructor(redirectUrl: string) {
    const { publicKey, privateKey } = generateAsymmetricKeys()

    this.privateKey = privateKey
    this.nonce = generateNonce()

    const forumUrl = FORUM_URL.endsWith('/') ? FORUM_URL.slice(0, -1) : FORUM_URL
    const url = new URL(`${forumUrl}/user-api-key/new`)

    url.searchParams.append('auth_redirect', redirectUrl)
    url.searchParams.append('application_name', APP_NAME)
    url.searchParams.append('client_id', hostname())
    url.searchParams.append('scopes', 'write')
    url.searchParams.append('public_key', publicKey)
    url.searchParams.append('nonce', this.nonce)

    this.url = url.href
  }

  getUrl() {
    return this.url
  }

  getUserApiKey(encodedKey: string): string {
    const result = decrypt(encodedKey, this.privateKey)
    const parsedResult = JSON.parse(result)

    if (parsedResult.nonce !== this.nonce) {
      throw new Error('Nonce does not match')
    }

    return JSON.parse(result).key
  }
}
