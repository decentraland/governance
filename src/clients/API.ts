/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthIdentity } from '@dcl/crypto/dist/types'
import {
  AUTH_CHAIN_HEADER_PREFIX,
  AUTH_METADATA_HEADER,
  AUTH_TIMESTAMP_HEADER,
} from 'decentraland-crypto-middleware/lib/types'

import { signPayload } from '../front/context/auth/identify'
import { getCurrentIdentity } from '../front/context/auth/storage'

import { toBase64 } from './base64'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
const METHODS_WITH_BODY: HttpMethod[] = ['POST', 'PUT', 'PATCH']

export type ApiOptions = {
  method: HttpMethod
  json?: any
  sign?: boolean
  headers?: Record<string, string>
}

export default abstract class API {
  private readonly baseUrl: string
  private defaultHeaders: Record<string, string> = {}

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  protected async fetch<T>(endpoint: string, options: ApiOptions = { method: 'GET', sign: false }): Promise<T> {
    const { method, json, sign, headers = {} } = options
    const jsonHeaders = this.getJsonHeaders(method, json)
    const authAndSignatureHeaders = sign ? await this.getAuthorizationAndSignatureHeaders(endpoint, options) : {}

    const finalHeaders = {
      ...this.defaultHeaders,
      ...headers,
      ...jsonHeaders,
      ...authAndSignatureHeaders,
    }

    const response = await fetch(this.url(endpoint), {
      method,
      headers: finalHeaders,
      body: json ? JSON.stringify(json) : undefined,
    })

    await this.checkForErrors(response)

    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    } else {
      throw new Error(`Expected JSON response but received non-JSON content: ${await response.text()}`)
    }
  }

  private async checkForErrors(response: Response) {
    if (!response.ok) {
      let errorBody = await response.text()
      const contentType = response.headers.get('Content-Type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorJson = await response.json()
          errorBody = JSON.stringify(errorJson)
        } catch (e) {
          // If JSON parsing fails, fallback to using the text response (errorBody already set)
        }
      }
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }
  }

  private getJsonHeaders(method: HttpMethod, json?: any) {
    const hasBody = METHODS_WITH_BODY.includes(method) && json !== undefined
    const jsonHeaders: Record<string, string> = {}
    if (hasBody) {
      jsonHeaders['Content-Type'] = 'application/json'
    }
    return jsonHeaders
  }

  private url(endpoint: string) {
    return `${this.baseUrl}${endpoint}`
  }

  protected setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value
  }

  async getAuthorizationAndSignatureHeaders(endpoint: string, options: ApiOptions): Promise<Record<string, string>> {
    const identity: AuthIdentity | null = getCurrentIdentity()
    if (!identity?.authChain) {
      throw new Error(`Missing identity to authorize & sign the request, ${JSON.stringify({ endpoint, options })}`)
    }
    const auth = { Authorization: 'Bearer ' + toBase64(JSON.stringify(identity.authChain)) }

    const signature: Record<string, string> = {}
    const timestamp = String(Date.now())
    const pathname = new URL(this.url(endpoint), 'https://localhost').pathname
    const method = options.method
    const metadata = ''
    const payload = [method, pathname, timestamp, metadata].join(':').toLowerCase()
    const chain = await signPayload(identity, payload)

    chain.forEach((link, index) => {
      signature[AUTH_CHAIN_HEADER_PREFIX + index] = JSON.stringify(link)
    })
    signature[AUTH_TIMESTAMP_HEADER] = timestamp
    signature[AUTH_METADATA_HEADER] = metadata

    return { ...auth, ...signature }
  }

  protected toQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    })
    return searchParams.toString() ? `?${searchParams.toString()}` : ''
  }
}
