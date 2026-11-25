import { ErrorClient } from './ErrorClient'
import { inBatches, queryGraphql, trimLastForwardSlash } from './utils'

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

describe('queryGraphql', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the server responds with an HTTP error', () => {
    let cancel: jest.SpyInstance

    beforeEach(async () => {
      const response = new Response('<html>bad gateway</html>', { status: 502 })
      cancel = jest.spyOn(response.body!, 'cancel')
      jest.spyOn(global, 'fetch').mockResolvedValue(response)
      await queryGraphql('https://subgraph.test', { query: '{ x }' }).catch(() => undefined)
    })

    // Unread, the body would keep its connection until garbage collection.
    it('should release the body it does not read', () => {
      expect(cancel).toHaveBeenCalled()
    })
  })
})
