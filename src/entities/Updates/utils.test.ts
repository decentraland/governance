import { ProjectHealth, UpdateAttributes, UpdateStatus } from './types'
import { getNextUpdate, getPublicUpdates, getPendingUpdates, getCurrentUpdate } from './utils'
import { v1 as uuid } from 'uuid'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

type GenerateUpdate = Pick<
  UpdateAttributes,
  'health' | 'introduction' | 'highlights' | 'blockers' | 'next_steps' | 'additional_notes' | 'status' | 'created_at' | 'updated_at' | 'due_date' | 'completion_date'
>
const generateUpdate = (update: GenerateUpdate): UpdateAttributes => ({
  id: uuid(),
  proposal_id: uuid(),
  health: update.health,
  introduction: update.introduction,
  highlights: update.highlights,
  blockers: update.blockers,
  next_steps: update.next_steps,
  additional_notes: update.additional_notes,
  status: update.status,
  due_date: update.due_date,
  completion_date: update.completion_date,
  created_at: update.created_at,
  updated_at: update.updated_at,
})

const now = new Date('2022-03-18')
jest.useFakeTimers('modern').setSystemTime(now)

const DONE_UPDATE = generateUpdate({
  health: ProjectHealth.OnTrack,
  introduction: 'Introduction',
  highlights: 'Highlights',
  blockers: 'Blockers',
  next_steps: 'Next steps',
  additional_notes: 'Additional notes',
  status: UpdateStatus.Done,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(1, 'month').toDate(),
  completion_date: Time(now).add(20, 'day').toDate(),
})

const DONE_UPDATE_OUT_OF_SCHEDULE = generateUpdate({
  health: ProjectHealth.OnTrack,
  introduction: 'Introduction',
  highlights: 'Highlights',
  blockers: 'Blockers',
  next_steps: 'Next steps',
  additional_notes: 'Additional notes',
  status: UpdateStatus.Done,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: undefined,
  completion_date: Time(now).add(21, 'day').toDate(),
})

const PENDING_UPDATE = generateUpdate({
  health: undefined,
  introduction: undefined,
  highlights: undefined,
  blockers: undefined,
  next_steps: undefined,
  additional_notes: undefined,
  status: UpdateStatus.Pending,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(1, 'month').toDate(),
  completion_date: undefined,
})

const FUTURE_PENDING_UPDATE = generateUpdate({
  health: undefined,
  introduction: undefined,
  highlights: undefined,
  blockers: undefined,
  next_steps: undefined,
  additional_notes: undefined,
  status: UpdateStatus.Pending,
  created_at: Time(now).subtract(1, 'day').toDate(),
  updated_at: Time(now).subtract(1, 'day').toDate(),
  due_date: Time(now).add(2, 'month').toDate(),
  completion_date: undefined,
})

const MISSED_UPDATE = generateUpdate({
  health: undefined,
  introduction: undefined,
  highlights: undefined,
  blockers: undefined,
  next_steps: undefined,
  additional_notes: undefined,
  status: UpdateStatus.Pending,
  created_at: Time(now).subtract(2, 'day').toDate(),
  updated_at: Time(now).subtract(2, 'day').toDate(),
  due_date: Time(now).subtract(1, 'day').toDate(),
  completion_date: undefined,
})

const LATE_UPDATE = generateUpdate({
  health: ProjectHealth.OnTrack,
  introduction: 'Introduction',
  highlights: 'Highlights',
  blockers: 'Blockers',
  next_steps: 'Next steps',
  additional_notes: 'Additional notes',
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

  describe('when there is one pending, one done, one missed, one late and one out of schedule', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE, DONE_UPDATE, LATE_UPDATE, MISSED_UPDATE, DONE_UPDATE_OUT_OF_SCHEDULE]

    it('should return out of schedule first and then done,late and missed updates', () => {
      expect(getPublicUpdates(updates)).toEqual([DONE_UPDATE_OUT_OF_SCHEDULE, DONE_UPDATE, LATE_UPDATE, MISSED_UPDATE])
    })
  })
})

describe('Remaining updates', () => {
  describe('when there are no updates for a proposal', () => {
    let updates: UpdateAttributes[] = []

    it('should return no updates', () => {
      expect(getPendingUpdates(updates)).toEqual([])
    })
  })

  describe('when there is non-pending updates for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE]

    it('should return no updates', () => {
      expect(getPendingUpdates(updates)).toEqual([])
    })
  })

  describe('when there is one done and one pending update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE, PENDING_UPDATE]

    it('should return the pending update', () => {
      expect(getPendingUpdates(updates)).toEqual([PENDING_UPDATE])
    })
  })
})

describe('Current update', () => {
  describe('when there are no updates for a proposal', () => {
    let updates: UpdateAttributes[] = []

    it('should return no update', () => {
      expect(getCurrentUpdate(updates)).toEqual(null)
    })
  })

  describe('when there is one done update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE]

    it('should return closest done update', () => {
      expect(getCurrentUpdate(updates)).toEqual(DONE_UPDATE)
    })
  })

  describe('when there is one late update and one pending for a proposal', () => {
    let updates: UpdateAttributes[] = [LATE_UPDATE, PENDING_UPDATE]

    it('should return the pending update', () => {
      expect(getCurrentUpdate(updates)).toEqual(PENDING_UPDATE)
    })
  })

  describe('when there are two pending updates for a proposal', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE, FUTURE_PENDING_UPDATE]

    it('should return the closest update', () => {
      expect(getCurrentUpdate(updates)).toEqual(PENDING_UPDATE)
    })
  })

  describe('when there is a done update and a future pending update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE, FUTURE_PENDING_UPDATE]

    it('should return done update', () => {
      expect(getCurrentUpdate(updates)).toEqual(DONE_UPDATE)
    })
  })

  describe('when there is one pending and one missed update for a proposal', () => {
    let updates: UpdateAttributes[] = [PENDING_UPDATE, MISSED_UPDATE]

    it('should return the closest future update', () => {
      expect(getCurrentUpdate(updates)).toEqual(PENDING_UPDATE)
    })
  })

  describe('when there is one done and one missed update for a proposal', () => {
    let updates: UpdateAttributes[] = [DONE_UPDATE, MISSED_UPDATE]

    it('should return done update', () => {
      expect(getCurrentUpdate(updates)).toEqual(DONE_UPDATE)
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

    it('should return future update', () => {
      expect(getNextUpdate(updates)).toEqual(FUTURE_PENDING_UPDATE)
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
