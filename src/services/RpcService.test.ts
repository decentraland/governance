import http from 'http'
import { AddressInfo } from 'net'

import { getEnvironmentChainId } from '../helpers'

import RpcService, { ENVIRONMENT_RPC_TIMEOUT_MS } from './RpcService'

describe('RpcService.getEnvironmentProvider', () => {
  const originalRpcUrl = process.env.RPC_PROVIDER_URL

  afterEach(() => {
    process.env.RPC_PROVIDER_URL = originalRpcUrl
  })

  // ethers' defaults (120 s timeout, up to 12 retries on 429) can hold a webhook request open for
  // minutes, long enough for overlapping Alchemy retries.
  it('should bound each request and know its network up front', () => {
    const provider = RpcService.getEnvironmentProvider()
    expect(provider.connection).toMatchObject({
      url: RpcService.getRpcUrl(),
      timeout: ENVIRONMENT_RPC_TIMEOUT_MS,
      throttleLimit: 1,
    })
    expect(provider.network.chainId).toBe(Number(getEnvironmentChainId()))
  })

  describe('when the RPC answers HTTP 429', () => {
    let server: http.Server
    let requests: string[]

    beforeEach(async () => {
      requests = []
      server = http.createServer((req, res) => {
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          requests.push(body)
          res.writeHead(429, { 'content-type': 'application/json', connection: 'close' })
          res.end('{"jsonrpc":"2.0","id":1,"error":{"code":429,"message":"rate limited"}}')
        })
      })
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
      process.env.RPC_PROVIDER_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
    })

    afterEach(async () => {
      jest.restoreAllMocks()
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    })

    it('should fail at once instead of backing off and retrying', async () => {
      // ethers leaves its request-timeout timer armed after an HTTP error; unref it so Jest can exit.
      const realSetTimeout = global.setTimeout
      jest
        .spyOn(global, 'setTimeout')
        .mockImplementation(((...args: Parameters<typeof setTimeout>) =>
          realSetTimeout(...args).unref()) as unknown as typeof setTimeout)
      const provider = RpcService.getEnvironmentProvider()
      await expect(provider.getLogs({ blockHash: '0x' + 'cc'.repeat(32) })).rejects.toThrow()
      expect(requests).toHaveLength(1)
      expect(JSON.parse(requests[0]).method).toBe('eth_getLogs')
    })
  })
})
