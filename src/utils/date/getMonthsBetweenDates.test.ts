import { getMonthsBetweenDates } from './getMonthsBetweenDates'

describe('getMonthsBetweenDates', () => {
  const testItHasMonthsAndDays = (date1: string, date2: string, months: number, extraDays: number) => {
    expect(getMonthsBetweenDates(new Date(date1), new Date(date2))).toEqual({ months, extraDays })
  }
  it('returns the exact amount of months and days between dates ', () => {
    testItHasMonthsAndDays('2023-01-01 00:00:00z', '2023-05-01 00:00:00z', 4, 0)
    testItHasMonthsAndDays('2023-01-01 00:00:00z', '2023-05-31 00:00:00z', 4, 30)
    testItHasMonthsAndDays('2023-01-15 00:00:00z', '2023-05-30 00:00:00z', 4, 15)
    testItHasMonthsAndDays('2023-01-20 00:00:00z', '2023-05-25 00:00:00z', 4, 5)
    testItHasMonthsAndDays('2023-01-25 00:00:00z', '2023-05-10 00:00:00z', 3, 15)
    testItHasMonthsAndDays('2023-01-05 00:00:00z', '2023-05-30 00:00:00z', 4, 25)
    testItHasMonthsAndDays('2023-01-01 00:00:00z', '2023-03-31 00:00:00z', 2, 30)
    testItHasMonthsAndDays('2023-06-05T00:00:00z', '2023-10-30T00:00:00z', 4, 25)
    testItHasMonthsAndDays('2023-04-30 00:00:00z', '2024-02-24 00:00:00z', 9, 25)
    testItHasMonthsAndDays('2022-04-30 00:00:00z', '2024-02-24 00:00:00z', 21, 25)
    testItHasMonthsAndDays('2022-01-01', '2022-01-01', 0, 0)
    testItHasMonthsAndDays('2022-01-01', '2022-12-31', 11, 30)
    testItHasMonthsAndDays('2022-01-01', '2023-01-01', 12, 0)
    testItHasMonthsAndDays('2022-01-01', '2024-12-31', 35, 30)
    testItHasMonthsAndDays('2022-01-01', '2025-01-01', 36, 0)
    testItHasMonthsAndDays('2022-01-01', '2022-03-31', 2, 30)
  })
})
