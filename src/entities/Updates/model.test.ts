import crypto from 'crypto'

import Time from '../../utils/date/Time'
import { getMonthsBetweenDates } from '../../utils/date/getMonthsBetweenDates'
import { VestingStartDate } from '../Grant/types'

import UpdateModel from './model'
import { UpdateStatus } from './types'

const PROPOSAL_ID = '123'
const UUID = '00000000-0000-0000-0000-000000000000'

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
  })

  describe('createPendingUpdates', () => {
    describe('for a vesting with a duration of almost 3 months', () => {
      const vestingDates = {
        vestingStartAt: '2020-01-01 00:00:00z',
        vestingFinishAt: '2020-03-31 00:00:00z',
      }

      describe('when preferred payment date is on the 1st of the month', () => {
        const preferredPaymentDate = VestingStartDate.First

        it('calculates the correct amount of pending updates', () => {
          expect(
            getMonthsBetweenDates(new Date(vestingDates.vestingStartAt), new Date(vestingDates.vestingFinishAt))
          ).toEqual({ months: 2, extraDays: 30 })
          expect(UpdateModel.getAmountOfUpdates(vestingDates)).toEqual(3)
        })

        it('deletes any pending updates for the proposal', async () => {
          await UpdateModel.createPendingUpdates(PROPOSAL_ID, vestingDates, preferredPaymentDate)
          expect(UpdateModel.delete).toHaveBeenCalledWith({ proposal_id: PROPOSAL_ID, status: UpdateStatus.Pending })
        })

        it('creates expected pending updates with the correct attributes', async () => {
          await UpdateModel.createPendingUpdates(PROPOSAL_ID, vestingDates, preferredPaymentDate)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-02-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-03-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-04-01T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })
    })

    describe('for a vesting with a duration of 6 months and some extra days, with a starting date different than the preferred', () => {
      const vestingDates = {
        vestingStartAt: '2020-11-17 00:00:00z',
        vestingFinishAt: '2020-04-31 00:00:00z',
      }

      describe('when preferred payment date is on the 15th of the month', () => {
        const preferredPaymentDate = VestingStartDate.Fifteenth

        it('calculates the correct amount of pending updates', () => {
          expect(
            getMonthsBetweenDates(new Date(vestingDates.vestingStartAt), new Date(vestingDates.vestingFinishAt))
          ).toEqual({ months: 6, extraDays: 16 })
          expect(UpdateModel.getAmountOfUpdates(vestingDates)).toEqual(7)
        })

        it('creates expected pending updates with the correct attributes', async () => {
          await UpdateModel.createPendingUpdates(PROPOSAL_ID, vestingDates, preferredPaymentDate)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-12-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-01-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-02-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-03-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-04-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-05-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-06-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })
    })

    describe('for a vesting with a duration of exactly 6 months', () => {
      const vestingDates = {
        vestingStartAt: '2020-07-01 00:00:00z',
        vestingFinishAt: '2021-01-01 00:00:00z',
      }

      describe('when preferred payment date is on the 15th of the month', () => {
        const preferredPaymentDate = VestingStartDate.Fifteenth

        it('calculates the correct amount of pending updates', () => {
          expect(
            getMonthsBetweenDates(new Date(vestingDates.vestingStartAt), new Date(vestingDates.vestingFinishAt))
          ).toEqual({ months: 6, extraDays: 0 })
          expect(UpdateModel.getAmountOfUpdates(vestingDates)).toEqual(6)
        })

        it('creates expected pending updates with the correct attributes', async () => {
          await UpdateModel.createPendingUpdates(PROPOSAL_ID, vestingDates, preferredPaymentDate)
          expect(UpdateModel.createMany).toHaveBeenCalledWith([
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-08-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-09-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-10-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-11-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2020-12-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
            {
              id: UUID,
              proposal_id: PROPOSAL_ID,
              status: UpdateStatus.Pending,
              due_date: Time.utc('2021-01-15T00:00:00.000Z').toDate(),
              created_at: FAKE_NOW,
              updated_at: FAKE_NOW,
            },
          ])
        })
      })
    })
  })

  describe('getFirstUpdateStartingDate', () => {
    const FAKE_TODAY = new Date('2020-01-07 00:01:00z')
    const getSubject = (vestingStartDate: string, preferredPaymentDate: VestingStartDate) =>
      UpdateModel.getFirstUpdateStartingDate(vestingStartDate, preferredPaymentDate)

    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(FAKE_TODAY)
    })

    describe('when preferred payment date is on the 1st of the month', () => {
      const preferredPaymentDate = VestingStartDate.First

      describe('when vesting started on the 1st of the current month', () => {
        const vestingStartDate = '2020-01-01 00:00:00z'

        it('should return the 1st of this month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-01-01 00:00:00.000Z'))
        })
      })
      describe('when vesting started on the 15th of the current month', () => {
        const vestingStartDate = '2020-01-15 00:00:00z'

        it('should return the 1st of this month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-01-01 00:00:00.000Z'))
        })
      })
      describe('when vesting started on a random day of the current month', () => {
        const vestingStartDate = '2020-01-27 00:00:00z'

        it('should return the 1st of this month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-01-01 00:00:00.000Z'))
        })
      })
      describe('when vesting starts on the 1st next month', () => {
        const vestingStartDate = '2020-02-01 00:00:00z'

        it('should return the 1st of next month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-02-01 00:00:00.000Z'))
        })
      })
      describe('when vesting starts on the 15th next month', () => {
        const vestingStartDate = '2020-02-15 00:00:00z'

        it('should return the 1st of next month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-02-01 00:00:00.000Z'))
        })
      })
      describe('when vesting starts on any given day of next month', () => {
        const vestingStartDate = '2020-02-14 00:00:00z'

        it('should return the 1st of next month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-02-01 00:00:00.000Z'))
        })
      })
    })

    describe('when preferred payment date is on the 15th of the month', () => {
      const preferredPaymentDate = VestingStartDate.Fifteenth

      describe('when vesting started on the 1st of the current month', () => {
        const vestingStartDate = '2020-01-01 00:00:00z'

        it('should return the 15th of the current month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-01-15 00:00:00.000Z'))
        })
      })
      describe('when vesting started on the 15th of the current month', () => {
        const vestingStartDate = '2020-01-15 00:00:00z'

        it('should return the 15th of the current month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-01-15 00:00:00.000Z'))
        })
      })
      describe('when vesting started on a random day of the current month', () => {
        const vestingStartDate = '2020-01-27 00:00:00z'

        it('should return the 15th of the current month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-01-15 00:00:00.000Z'))
        })
      })
      describe('when vesting starts on the 1st next month', () => {
        const vestingStartDate = '2020-02-01 00:00:00z'

        it('should return the 15th of next month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-02-15 00:00:00.000Z'))
        })
      })
      describe('when vesting starts on the 15th next month', () => {
        const vestingStartDate = '2020-02-15 00:00:00z'

        it('should return the 15th of next month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-02-15 00:00:00.000Z'))
        })
      })
      describe('when vesting starts on any given day of the next month', () => {
        const vestingStartDate = '2020-02-14 00:00:00z'

        it('should return the 15th of next month', () => {
          expect(getSubject(vestingStartDate, preferredPaymentDate)).toEqual(Time.utc('2020-02-15 00:00:00.000Z'))
        })
      })
    })
  })

  describe('getDueDate', () => {
    it('returns the same date for following month plus the index', () => {
      expect(UpdateModel.getDueDate(Time.utc('2020-11-01 00:00:00.000Z'), 0)).toEqual(
        new Date('2020-12-01 00:00:00.000Z')
      )
      expect(UpdateModel.getDueDate(Time.utc('2020-11-15 00:00:00.000Z'), 0)).toEqual(
        new Date('2020-12-15 00:00:00.000Z')
      )
      expect(UpdateModel.getDueDate(Time.utc('2020-11-15 00:00:00.000Z'), 1)).toEqual(
        new Date('2021-01-15 00:00:00.000Z')
      )
      expect(UpdateModel.getDueDate(Time.utc('2020-11-01 00:00:00.000Z'), 1)).toEqual(
        new Date('2021-01-01 00:00:00.000Z')
      )
      expect(UpdateModel.getDueDate(Time.utc('2020-11-15 00:00:00.000Z'), 2)).toEqual(
        new Date('2021-02-15 00:00:00.000Z')
      )
    })
  })
})
