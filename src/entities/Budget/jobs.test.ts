import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { DclData } from '../../clients/DclData'

import { getTransparencyBudgets } from './jobs'

const VALID_BUDGET_1 = {
  category_percentages: {
    accelerator: 7,
    core_unit: 15,
    documentation: 3,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-01-01T00:00:00Z',
  total: 1501500,
}

const VALID_BUDGET_2 = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-05-01T00:00:00Z',
  total: 1501500,
}

const INVALID_BUDGET_FORMAT = {
  category_percentages: {
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-05-01T00:00:00Z',
  total: 1501500,
}
describe('getTransparencyBudgets', () => {
  describe('when it receives a list of valid budgets', () => {
    jest.spyOn(DclData.get(), 'getBudgets').mockResolvedValue([VALID_BUDGET_1, VALID_BUDGET_2])
    it('returns a list of parsed budgets', async () => {
      expect(await getTransparencyBudgets()).toEqual([VALID_BUDGET_1, VALID_BUDGET_2])
    })
  })

  describe('when it receives a list with no valid budgets', () => {
    beforeAll(() => jest.spyOn(DclData.get(), 'getBudgets').mockImplementation(async () => [INVALID_BUDGET_FORMAT]))

    it('logs the error', async () => {
      const logError = jest.spyOn(logger, 'error')
      await getTransparencyBudgets()
      expect(logError).toHaveBeenCalled()
    })

    it('returns an empty list', async () => {
      expect(await getTransparencyBudgets()).toEqual([])
    })

    afterAll(() => jest.clearAllMocks())
  })

  describe('when it receives an empty list of budgets', () => {
    beforeAll(() => jest.spyOn(DclData.get(), 'getBudgets').mockResolvedValue([]))

    it('logs the error', async () => {
      const logError = jest.spyOn(logger, 'error')
      await getTransparencyBudgets()
      expect(logError).toHaveBeenCalled()
    })

    it('returns an empty list', async () => {
      expect(await getTransparencyBudgets()).toEqual([])
    })

    afterAll(() => jest.clearAllMocks())
  })

  describe('when it receives a list with valid and invalid budgets', () => {
    beforeAll(() => jest.spyOn(DclData.get(), 'getBudgets').mockResolvedValue([VALID_BUDGET_1, INVALID_BUDGET_FORMAT]))

    it('logs the error', async () => {
      const logError = jest.spyOn(logger, 'error')
      await getTransparencyBudgets()
      expect(logError).toHaveBeenCalled()
    })

    it('returns an empty list', async () => {
      expect(await getTransparencyBudgets()).toEqual([])
    })

    afterAll(() => jest.clearAllMocks())
  })
})
