import Time from './Time'
import { getPreviousMonthStartAndEnd } from './getPreviousMonthStartAndEnd'

describe('getPreviousMonthStartAndEnd', () => {
  it('calculates start and end dates correctly', () => {
    const middleOfYear = Time.utc('2023-07-15').toDate()
    const middleOfYearResult = getPreviousMonthStartAndEnd(middleOfYear)
    expect(middleOfYearResult.start.toISOString()).toBe('2023-06-01T00:00:00.000Z')
    expect(middleOfYearResult.end.toISOString()).toBe('2023-06-30T23:59:59.999Z')

    const beginningOfYear = Time.utc('2023-01-01').toDate()
    const beginningOfYearResult = getPreviousMonthStartAndEnd(beginningOfYear)
    expect(beginningOfYearResult.start.toISOString()).toBe('2022-12-01T00:00:00.000Z')
    expect(beginningOfYearResult.end.toISOString()).toBe('2022-12-31T23:59:59.999Z')
  })
})
