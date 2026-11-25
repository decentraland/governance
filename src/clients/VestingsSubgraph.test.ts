import { VestingsSubgraph } from './VestingsSubgraph'

const ENDPOINT = 'https://subgraph.test/vestings'
const ADDRESS = '0x7A3ABF8897F31B56F09C6F69D074A393A905C1AC'

function respond(body: unknown, status = 200) {
  return jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
}

describe('VestingsSubgraph.getVesting', () => {
  const subgraph = new VestingsSubgraph(ENDPOINT)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the subgraph has the vesting', () => {
    it('should return it', async () => {
      respond({ data: { vestings: [{ id: ADDRESS.toLowerCase() }] } })
      expect(await subgraph.getVesting(ADDRESS)).toEqual({ id: ADDRESS.toLowerCase() })
    })

    it('should ask for the address lowercased', async () => {
      const fetchSpy = respond({ data: { vestings: [] } })
      await subgraph.getVesting(ADDRESS)
      const { variables } = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))
      expect(variables).toEqual({ address: ADDRESS.toLowerCase() })
    })
  })

  describe('when the subgraph does not index the vesting', () => {
    it('should return null', async () => {
      respond({ data: { vestings: [] } })
      expect(await subgraph.getVesting(ADDRESS)).toBeNull()
    })
  })

  describe('when the subgraph responds with an HTTP error', () => {
    it('should throw', async () => {
      respond({ message: 'bad gateway' }, 502)
      await expect(subgraph.getVesting(ADDRESS)).rejects.toThrow('failed with status 502')
    })
  })

  describe('when the subgraph responds with GraphQL errors', () => {
    it('should throw', async () => {
      respond({ errors: [{ message: 'indexing error' }] })
      await expect(subgraph.getVesting(ADDRESS)).rejects.toThrow('indexing error')
    })
  })

  describe('when the response carries no data', () => {
    it('should throw rather than treat it as not indexed', async () => {
      respond({})
      await expect(subgraph.getVesting(ADDRESS)).rejects.toThrow('returned no data')
    })
  })

  describe('when the request fails', () => {
    it('should throw', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'))
      await expect(subgraph.getVesting(ADDRESS)).rejects.toThrow('fetch failed')
    })
  })
})
