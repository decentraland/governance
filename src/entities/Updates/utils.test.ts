import { UpdateAttributes, UpdateStatus } from './types'
import { getNextUpdate, getPublicUpdates } from './utils'
import { v1 as uuid } from 'uuid'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

type GenerateUpdate = Pick<
  UpdateAttributes,
  'title' | 'description' | 'status' | 'created_at' | 'updated_at' | 'due_date' | 'completion_date'
>
const generateUpdate = (update: GenerateUpdate): UpdateAttributes => ({
  id: uuid(),
  proposal_id: uuid(),
  title: update.title,
  description: update.description,
  status: update.status,
  due_date: update.due_date,
  completion_date: update.completion_date,
  created_at: update.created_at,
  updated_at: update.updated_at,
})

const now = new Date('2022-03-18')
jest.useFakeTimers('modern').setSystemTime(now)

const DONE_UPDATE = generateUpdate({
  title: 'Title',
  description: 'Description',
  status: UpdateStatus.Done,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(1, 'month').toDate(),
  completion_date: Time(now).add(20, 'day').toDate(),
})

const PENDING_UPDATE = generateUpdate({
  title: undefined,
  description: undefined,
  status: UpdateStatus.Pending,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(1, 'month').toDate(),
  completion_date: undefined,
})

const FUTURE_PENDING_UPDATE = generateUpdate({
  title: undefined,
  description: undefined,
  status: UpdateStatus.Pending,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(2, 'month').toDate(),
  completion_date: undefined,
})

const MISSED_UPDATE = generateUpdate({
  title: undefined,
  description: undefined,
  status: UpdateStatus.Pending,
  created_at: Time(now).subtract(2, 'day').toDate(),
  updated_at: Time(now).subtract(2, 'day').toDate(),
  due_date: Time(now).subtract(1, 'day').toDate(),
  completion_date: undefined,
})

const LATE_UPDATE = generateUpdate({
  title: 'Title',
  description: 'Description',
  status: UpdateStatus.Late,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(1, 'month').toDate(),
  completion_date: Time(now).add(1, 'month').add(3, 'day').toDate(),
})

describe('Public updates', () => {
  describe('when there are no updates for a proposal', () => {
    let updates: UpdateAttributes[] = []

    it('should return no updates', () => {
      expect(getPublicUpdates(updates)).toEqual([])
    })
  })

  describe('when there is one done update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE]

    it('should return one update', () => {
      expect(getPublicUpdates(updates)).toEqual(updates)
    })
  })

  describe('when there is one done update and one pending for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE, PENDING_UPDATE]

    it('should return the done update', () => {
      expect(getPublicUpdates(updates)).toEqual([DONE_UPDATE])
    })
  })

  describe('when there is one pending', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE]

    it('should return no updates', () => {
      expect(getPublicUpdates(updates)).toEqual([])
    })
  })

  describe('when there is one pending, one done, one missed and one late', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE, DONE_UPDATE, LATE_UPDATE, MISSED_UPDATE]

    it('should return done, late and missed updates', () => {
      expect(getPublicUpdates(updates)).toEqual([DONE_UPDATE, LATE_UPDATE, MISSED_UPDATE])
    })
  })
})

describe('Next update', () => {
  describe('when there are no updates for a proposal', () => {
    let updates: UpdateAttributes[] = []

    it('should return no update', () => {
      expect(getNextUpdate(updates)).toEqual(null)
    })
  })

  describe('when there is one done update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE]

    it('should return no update', () => {
      expect(getNextUpdate(updates)).toEqual(null)
    })
  })

  describe('when there is one late update and one pending for a proposal', () => {
    let updates: UpdateAttributes[] = [LATE_UPDATE, PENDING_UPDATE]

    it('should return the pending update', () => {
      expect(getNextUpdate(updates)).toEqual(PENDING_UPDATE)
    })
  })

  describe('when there are two pending updates for a proposal', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE, FUTURE_PENDING_UPDATE]

    it('should return the closest future update', () => {
      expect(getNextUpdate(updates)).toEqual(PENDING_UPDATE)
    })
  })

  describe('when there is a done update and a future pending update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE, FUTURE_PENDING_UPDATE]

    it('should return no update', () => {
      expect(getNextUpdate(updates)).toEqual(null)
    })
  })

  describe('when there is one pending and one missed update for a proposal', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE, MISSED_UPDATE]

    it('should return the closest future update', () => {
      expect(getNextUpdate(updates)).toEqual(PENDING_UPDATE)
    })
  })

  describe('when there is one done and one missed update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE, MISSED_UPDATE]

    it('should return no update', () => {
      expect(getNextUpdate(updates)).toEqual(null)
    })
  })
})
