import { LandOwnersUnavailableError, getLandOwnerAddresses } from './utils'

const FIRST_OWNER = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
const SECOND_OWNER = '0x49E4DbfF86a2E5DA27c540c9A9E8D2C3726E278F'

describe('getLandOwnerAddresses', () => {
  let fetchMock: jest.SpyInstance

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the land api answers with owned tiles', () => {
    let result: string[]

    beforeEach(async () => {
      fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({
          data: {
            '0,0': { owner: FIRST_OWNER },
            '0,1': { owner: FIRST_OWNER },
            '1,0': { owner: SECOND_OWNER },
          },
        }),
      } as Response)
      result = await getLandOwnerAddresses()
    })

    it('should return each owner once, lowercased', () => {
      expect(result).toEqual([FIRST_OWNER.toLowerCase(), SECOND_OWNER.toLowerCase()])
    })
  })

  describe('and one of the tiles carries no owner', () => {
    let result: string[]

    beforeEach(async () => {
      fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({
          data: {
            '0,0': { owner: FIRST_OWNER },
            '0,1': {},
          },
        }),
      } as Response)
      result = await getLandOwnerAddresses()
    })

    // A single malformed entry used to throw, and the throw became an empty list, which is the shape
    // that revokes every holder. Skipping the entry keeps the rest of the list usable.
    it('should skip that tile and keep the remaining owners', () => {
      expect(result).toEqual([FIRST_OWNER.toLowerCase()])
    })
  })

  describe('when the land api request fails', () => {
    beforeEach(() => {
      fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
    })

    // Revocation is derived from absence, so answering with an empty list would revoke every holder.
    it('should throw rather than answer with an empty list', async () => {
      await expect(getLandOwnerAddresses()).rejects.toThrow(LandOwnersUnavailableError)
    })
  })

  describe('and the land api answers with no tile data at all', () => {
    beforeEach(() => {
      fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({}),
      } as Response)
    })

    it('should throw rather than answer with an empty list', async () => {
      await expect(getLandOwnerAddresses()).rejects.toThrow(LandOwnersUnavailableError)
    })
  })

  describe('and the land api answers with tiles but no owners among them', () => {
    beforeEach(() => {
      fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({ data: { '0,0': {}, '0,1': {} } }),
      } as Response)
    })

    it('should throw rather than answer with an empty list', async () => {
      await expect(getLandOwnerAddresses()).rejects.toThrow(LandOwnersUnavailableError)
    })
  })

  describe('when the request is made', () => {
    beforeEach(async () => {
      fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: async () => ({ data: { '0,0': { owner: FIRST_OWNER } } }),
      } as Response)
      await getLandOwnerAddresses()
    })

    it('should abort rather than hang on an unresponsive land api', () => {
      expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { signal: expect.any(AbortSignal) })
    })
  })
})
