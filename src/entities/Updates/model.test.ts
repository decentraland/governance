import crypto from 'crypto'

import { UpdateService } from '../../back/services/update'
import * as VestingUtils from '../../clients/VestingData'
import { VestingWithLogs } from '../../clients/VestingData'
import { ProjectService } from '../../services/ProjectService'
import Time from '../../utils/date/Time'
import { getMonthsBetweenDates } from '../../utils/date/getMonthsBetweenDates'
import { ProjectStatus } from '../Grant/types'

import { Project } from './../../back/models/Project'

import UpdateModel from './model'
import { UpdateStatus } from './types'

const UUID = '00000000-0000-0000-0000-000000000000'
const PROPOSAL_ID = '00000000-0000-0000-0000-000000000001'
const PROJECT_ID = '00000000-0000-0000-0000-000000000002'

const MOCK_PROJECT: Project = {
  id: PROJECT_ID,
  proposal_id: PROPOSAL_ID,
  title: '',
  status: ProjectStatus.Pending,
  created_at: new Date(),
  vesting_addresses: [],
  personnel: [],
  links: [],
  milestones: [],
  author: '',
  coauthors: null,
}

function mockVestingData(vestingDates: VestingWithLogs) {
  jest.spyOn(VestingUtils, 'getVestingWithLogs').mockResolvedValue(vestingDates)
}

describe('UpdateModel', () => {
  const FAKE_NOW = Time.utc('2020-01-01 00:00:00z').toDate()

  beforeEach(() => {
    jest.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(UpdateModel, 'createMany').mockImplementation((list: any) => list)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(UpdateModel, 'delete').mockResolvedValue([] as any)
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(UUID)
    jest.useFakeTimers()
    jest.setSystemTime(FAKE_NOW)
    jest.spyOn(ProjectService, 'getUpdatedProject').mockResolvedValue(MOCK_PROJECT)
  })

  describe('createPendingUpdates', () => {
    describe('for a vesting with a duration of almost 3 months', () => {
      describe('when vesting start date is on the 1st of the month', () => {
        const vestingDates = {
          start_at: '2020-01-01 00:00:00z',
          finish_at: '2020-03-31 00:00:00z',
        } as VestingWithLogs

        it('calculates the correct amount of pending updates', () => {
          expect(getMonthsBetweenDates(new Date(vestingDates.start_at), new Date(vestingDates.finish_at))).toEqual({
            months: 2,
            extraDays: 30,
          })
          expect(UpdateService.getAmountOfUpdates(vestingDates)).toEqual(3)
        })

        it('deletes any pending updates for the proposal', async () => {
          mockVestingData(vestingDates)
          await UpdateService.initialize(PROJECT_ID)
          expect(UpdateModel.delete).toHaveBeenCalledWith({ project_id: PROJECT_ID, status: UpdateStatus.Pending })
        })

        it('creates expected pending updates with the correct attributes', async () => {
          mockVestingData(vestingDates)
          await UpdateService.initialize(PROJECT_ID)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-02-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-03-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-04-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })

      describe('when vesting start date is on the 15st of the month', () => {
        const vestingDates = {
          start_at: '2020-01-15 00:00:00z',
          finish_at: '2020-04-14 00:00:00z',
        } as VestingWithLogs

        it('calculates the correct amount of pending updates', () => {
          expect(getMonthsBetweenDates(new Date(vestingDates.start_at), new Date(vestingDates.finish_at))).toEqual({
            months: 2,
            extraDays: 30,
          })
          expect(UpdateService.getAmountOfUpdates(vestingDates)).toEqual(3)
        })

        it('deletes any pending updates for the proposal', async () => {
          await UpdateService.initialize(PROJECT_ID)
          expect(UpdateModel.delete).toHaveBeenCalledWith({ project_id: PROJECT_ID, status: UpdateStatus.Pending })
        })

        it('creates expected pending updates with the correct attributes', async () => {
          mockVestingData(vestingDates)
          await UpdateService.initialize(PROJECT_ID)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-02-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-03-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-04-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })
    })

    describe('for a vesting with a duration of 6 months and some extra days, with a starting date different than the preferred', () => {
      const vestingDates = {
        start_at: '2020-11-15 00:00:00z',
        finish_at: '2021-05-31 00:00:00z',
      } as VestingWithLogs

      describe('when vesting start date is on the 15th of the month', () => {
        it('calculates the correct amount of pending updates', () => {
          expect(getMonthsBetweenDates(new Date(vestingDates.start_at), new Date(vestingDates.finish_at))).toEqual({
            months: 6,
            extraDays: 16,
          })
          expect(UpdateService.getAmountOfUpdates(vestingDates)).toEqual(7)
        })

        it('creates expected pending updates with the correct attributes', async () => {
          mockVestingData(vestingDates)
          await UpdateService.initialize(PROJECT_ID)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-12-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-01-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-02-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-03-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-04-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-05-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-06-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })
    })

    describe('for a start date after the end date', () => {
      const vestingDates = {
        vestingStartAt: '2020-11-17 00:00:00z',
        vestingFinishAt: '2020-04-31 00:00:00z',
      }

      it('throws an error', () => {
        expect(() =>
          getMonthsBetweenDates(new Date(vestingDates.vestingStartAt), new Date(vestingDates.vestingFinishAt))
        ).toThrow()
      })
    })

    describe('for a vesting with a duration of exactly 6 months', () => {
      const vestingDates = {
        start_at: '2020-07-01 00:00:00z',
        finish_at: '2021-01-01 00:00:00z',
      } as VestingWithLogs

      describe('when the vesting contract start date is the first day of the month', () => {
        it('calculates the correct amount of pending updates', () => {
          expect(getMonthsBetweenDates(new Date(vestingDates.start_at), new Date(vestingDates.finish_at))).toEqual({
            months: 6,
            extraDays: 0,
          })
          expect(UpdateService.getAmountOfUpdates(vestingDates)).toEqual(6)
        })

        it('creates expected pending updates with the correct attributes', async () => {
          mockVestingData(vestingDates)
          await UpdateService.initialize(PROJECT_ID)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-08-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-09-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-10-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-11-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-12-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              project_id: PROJECT_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-01-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })
    })
  })

  describe('getDueDate', () => {
    it('returns the same date for following month plus the index', () => {
      expect(UpdateService.getDueDate(Time.utc('2020-11-01 00:00:00.000Z'), 0)).toEqual(
        new Date('2020-12-01 00:00:00.000Z')
      )
      expect(UpdateService.getDueDate(Time.utc('2020-11-15 00:00:00.000Z'), 0)).toEqual(
        new Date('2020-12-15 00:00:00.000Z')
      )
      expect(UpdateService.getDueDate(Time.utc('2020-11-15 00:00:00.000Z'), 1)).toEqual(
        new Date('2021-01-15 00:00:00.000Z')
      )
      expect(UpdateService.getDueDate(Time.utc('2020-11-01 00:00:00.000Z'), 1)).toEqual(
        new Date('2021-01-01 00:00:00.000Z')
      )
      expect(UpdateService.getDueDate(Time.utc('2020-11-15 00:00:00.000Z'), 2)).toEqual(
        new Date('2021-02-15 00:00:00.000Z')
      )
    })
  })
})
