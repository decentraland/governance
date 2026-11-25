import { redactSecrets } from './redactSecrets'

describe('redactSecrets', () => {
  describe('when the text contains a The Graph gateway url with an api key in the path', () => {
    it('should redact the key segment', () => {
      const input = 'https://gateway-arbitrum.network.thegraph.com/api/SECRETKEY123/subgraphs/id/abc'
      expect(redactSecrets(input)).toBe('https://gateway-arbitrum.network.thegraph.com/api/<redacted>/subgraphs/id/abc')
    })
  })

  describe('when the text contains a The Graph deployments url with an api key in the path', () => {
    it('should redact the key segment', () => {
      expect(redactSecrets('https://gateway.thegraph.com/api/SECRETKEY123/deployments/id/Qm123')).toBe(
        'https://gateway.thegraph.com/api/<redacted>/deployments/id/Qm123'
      )
    })
  })

  describe('when the text contains credentials in a url', () => {
    it('should redact them', () => {
      expect(redactSecrets('connect failed: postgres://governance:hunter2@db.internal:5432/governance')).toBe(
        'connect failed: postgres://<redacted>@db.internal:5432/governance'
      )
    })
  })

  describe('when the text contains a QuickNode or Ankr url', () => {
    it('should redact the token segment', () => {
      expect(redactSecrets('https://red-frosty-sun.quiknode.pro/0123456789abcdef0123456789abcdef/')).toBe(
        'https://red-frosty-sun.quiknode.pro/<redacted>/'
      )
      expect(redactSecrets('https://rpc.ankr.com/eth/0123456789abcdef0123456789abcdef')).toBe(
        'https://rpc.ankr.com/eth/<redacted>'
      )
    })
  })

  describe('when the text contains a Discord webhook url', () => {
    it('should redact the token', () => {
      expect(redactSecrets('POST https://discord.com/api/webhooks/123456789/abcDEF_-xyz failed')).toBe(
        'POST https://discord.com/api/webhooks/123456789/<redacted> failed'
      )
    })
  })

  describe('when the url carries a token without a password', () => {
    it('should redact it', () => {
      expect(redactSecrets('https://ghp_token123@github.com/org/repo')).toBe('https://<redacted>@github.com/org/repo')
    })
  })

  describe('when a query parameter name only ends in a secret word', () => {
    it('should redact its value', () => {
      expect(redactSecrets('https://api.test/?client_secret=s3&x-api-key=k3&auth=a3&page=2')).toBe(
        'https://api.test/?client_secret=<redacted>&x-api-key=<redacted>&auth=<redacted>&page=2'
      )
    })
  })

  describe('when the text has secret fields in quoted JSON', () => {
    it('should redact them and keep a token symbol', () => {
      expect(redactSecrets('{"apiKey":"abc","client_secret":"s","token":"MANA"}')).toBe(
        '{"apiKey":"<redacted>","client_secret":"<redacted>","token":"MANA"}'
      )
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
