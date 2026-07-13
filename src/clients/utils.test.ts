import { ErrorClient } from './ErrorClient'
import { inBatches, redactSecrets, trimLastForwardSlash } from './utils'

jest.mock('./ErrorClient', () => ({
  ErrorClient: {
    report: jest.fn(),
  },
}))

describe('trimLastForwardSlash', () => {
  it('should return the string without the last forward slash', () => {
    expect(trimLastForwardSlash('https://hub.snapshot.org')).toStrictEqual('https://hub.snapshot.org')
    expect(trimLastForwardSlash('https://hub.snapshot.org/')).toStrictEqual('https://hub.snapshot.org')
    expect(trimLastForwardSlash('https://testnet.snapshot.org/')).toStrictEqual('https://testnet.snapshot.org')
    expect(trimLastForwardSlash('https://testnet.snapshot.org')).toStrictEqual('https://testnet.snapshot.org')
  })
})

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

  describe('when the text contains no secrets', () => {
    it('should return it unchanged', () => {
      expect(redactSecrets('some error without a url')).toBe('some error without a url')
    })
  })
})

describe('inBatches', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when every batch resolves', () => {
    let fetchFunction: jest.Mock

    beforeEach(() => {
      fetchFunction = jest.fn().mockResolvedValueOnce([1, 2]).mockResolvedValueOnce([3])
    })

    it('should accumulate results across batches until a short batch ends pagination', async () => {
      const result = await inBatches(fetchFunction, {}, 2)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('when a batch rejects after earlier batches succeeded', () => {
    let fetchFunction: jest.Mock

    beforeEach(() => {
      fetchFunction = jest.fn().mockResolvedValueOnce([1, 2]).mockRejectedValueOnce(new Error('gateway 500'))
    })

    it('should return the partial results collected before the failure', async () => {
      const result = await inBatches(fetchFunction, {}, 2)
      expect(result).toEqual([1, 2])
    })

    it('should report the failure', async () => {
      await inBatches(fetchFunction, {}, 2)
      expect(ErrorClient.report).toHaveBeenCalled()
    })
  })
})
