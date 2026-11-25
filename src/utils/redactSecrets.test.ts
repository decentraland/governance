import { redactSecrets } from './redactSecrets'

describe('redactSecrets', () => {
  describe('when the text contains a The Graph gateway url with an api key in the path', () => {
    it('should redact the key segment', () => {
      const input = 'https://gateway-arbitrum.network.thegraph.com/api/SECRETKEY123/subgraphs/id/abc'
      expect(redactSecrets(input)).toBe('https://gateway-arbitrum.network.thegraph.com/api/<redacted>/subgraphs/id/abc')
    })
  })

  describe('when the text contains an apiKey query parameter', () => {
    it('should redact the parameter value', () => {
      expect(redactSecrets('https://score.snapshot.org/?apiKey=abc123&foo=bar')).toBe(
        'https://score.snapshot.org/?apiKey=<redacted>&foo=bar'
      )
    })
  })

  // ethers quotes the URL it called in SERVER_ERROR and TIMEOUT messages.
  describe('when the text contains an RPC url with the key in its path', () => {
    it('should redact an Alchemy key', () => {
      expect(
        redactSecrets('missing response (url="https://eth-mainnet.g.alchemy.com/v2/aBcDeFgHiJkLmNoPqRsTuVwXyZ012345")')
      ).toBe('missing response (url="https://eth-mainnet.g.alchemy.com/v2/<redacted>")')
    })

    it('should redact an Infura key', () => {
      expect(redactSecrets('https://mainnet.infura.io/v3/0123456789abcdef0123456789abcdef')).toBe(
        'https://mainnet.infura.io/v3/<redacted>'
      )
    })
  })

  describe('when the text contains a key or token query parameter', () => {
    it('should redact its value', () => {
      expect(redactSecrets('https://rpc.test/mainnet?key=s3cr3t&chain=1 and https://api.test?access_token=t0k3n')).toBe(
        'https://rpc.test/mainnet?key=<redacted>&chain=1 and https://api.test?access_token=<redacted>'
      )
    })
  })

  describe('when the text has a versioned path that is not a key', () => {
    it('should leave it alone', () => {
      expect(redactSecrets('GET https://api.test/v1/proposals/6a9d2bd4')).toBe(
        'GET https://api.test/v1/proposals/6a9d2bd4'
      )
    })
  })

  describe('when the text contains no secrets', () => {
    it('should return it unchanged', () => {
      expect(redactSecrets('some error without a url')).toBe('some error without a url')
    })
  })
})
