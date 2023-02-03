import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { DclData } from '../clients/DclData'

import { BudgetService } from './BudgetService'

export const VALID_TRANSPARENCY_BUDGET_1 = {
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

export const VALID_TRANSPARENCY_BUDGET_2 = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-04-01T00:00:00Z',
  total: 2000000,
}

export const VALID_TRANSPARENCY_BUDGET_3 = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-07-01T00:00:00Z',
  total: 1501500,
}

export const INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET = {
  category_percentages: {
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-07-01T00:00:00Z',
  total: 1501500,
}

export const INVALID_CATEGORIES_NAME_TRANSPARENCY_BUDGET = {
  category_percentages: {
    acelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-07-01T00:00:00Z',
  total: 1501500,
}

export const OVERLAPPING_TRANSPARENCY_BUDGET = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-02-01T00:00:00Z',
  total: 1501500,
}

function asserErrorLogging() {
  it('logs the error', async () => {
    const logError = jest.spyOn(logger, 'error')
    await BudgetService.getTransparencyBudgets()
    expect(logError).toHaveBeenCalled()
  })
}

describe('getTransparencyBudgets', () => {
  describe('when it receives a list of valid budgets', () => {
    jest
      .spyOn(DclData.get(), 'getBudgets')
      .mockResolvedValue([VALID_TRANSPARENCY_BUDGET_1, VALID_TRANSPARENCY_BUDGET_2])
    it('returns a list of parsed budgets', async () => {
      expect(await BudgetService.getTransparencyBudgets()).toEqual([
        VALID_TRANSPARENCY_BUDGET_1,
        VALID_TRANSPARENCY_BUDGET_2,
      ])
    })
    afterAll(() => jest.clearAllMocks())
  })

  describe('when it receives a list with no valid budgets', () => {
    beforeAll(() =>
      jest
        .spyOn(DclData.get(), 'getBudgets')
        .mockImplementation(async () => [INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET])
    )

    asserErrorLogging()

    it('returns an empty list', async () => {
      expect(await BudgetService.getTransparencyBudgets()).toEqual([])
    })

    afterAll(() => jest.clearAllMocks())
  })

  describe('when it receives an empty list of budgets', () => {
    beforeAll(() => jest.spyOn(DclData.get(), 'getBudgets').mockResolvedValue([]))

    asserErrorLogging()

    it('returns an empty list', async () => {
      expect(await BudgetService.getTransparencyBudgets()).toEqual([])
    })

    afterAll(() => jest.clearAllMocks())
  })

  describe('when it receives a list with valid and invalid budgets', () => {
    beforeAll(() =>
      jest
        .spyOn(DclData.get(), 'getBudgets')
        .mockResolvedValue([VALID_TRANSPARENCY_BUDGET_1, INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET])
    )

    asserErrorLogging()

    it('returns an empty list', async () => {
      expect(await BudgetService.getTransparencyBudgets()).toEqual([])
    })

    afterAll(() => jest.clearAllMocks())
  })
})
