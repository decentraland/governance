import { randomUUID } from 'crypto'
import database from 'decentraland-gatsby/dist/entities/Database/database'
import { Client } from 'pg'

import { VOTING_ENDS_SOON_MIN_REMAINING, VOTING_ENDS_SOON_WINDOW } from '../../src/entities/Proposal/constants'
import ProposalModel from '../../src/entities/Proposal/model'
import { ProposalAttributes, ProposalStatus } from '../../src/entities/Proposal/types'
import Time from '../../src/utils/date/Time'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProposalWith } from '../setup/factories'

// The model module reaches the notification and discord stack through its imports; none of it is
// needed to exercise the queries.
jest.mock('../../src/services/notification', () => ({ NotificationService: {} }))
jest.mock('../../src/services/discord', () => ({ DiscordService: {} }))

const STARTED_A_WEEK_AGO = () => new Date(Date.now() - 7 * Time.Day)

async function insertActive(finishInMs: number, overrides: Partial<ProposalAttributes> = {}): Promise<string> {
  const id = randomUUID()
  await insertProposalWith({
    id,
    status: ProposalStatus.Active,
    start_at: STARTED_A_WEEK_AGO(),
    finish_at: new Date(Date.now() + finishInMs),
    ...overrides,
  })
  return id
}

async function claim(): Promise<string[]> {
  const claimed = await ProposalModel.claimVotingEndsSoonReminders(
    VOTING_ENDS_SOON_WINDOW,
    VOTING_ENDS_SOON_MIN_REMAINING
  )
  return claimed.map((proposal) => proposal.id)
}

// Without this the commit could reach the server before the claim does, and the test would pass
// without ever exercising the claim waiting on the other session's row lock.
async function waitUntilBlockedOnARowLock(observer: Client) {
  const deadline = Date.now() + 5000
  while (Date.now() < deadline) {
    const { rows } = await observer.query<{ waiting: number }>(
      'SELECT count(*)::int AS waiting FROM pg_locks WHERE NOT granted'
    )
    if (rows[0].waiting > 0) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
  throw new Error('The claim never waited on the row lock')
}

async function readNotifiedAt(id: string): Promise<Date | null> {
  const rows = await database.query('SELECT voting_ends_soon_notified_at FROM proposals WHERE id = $1', [id])
  return rows[0].voting_ends_soon_notified_at
}

describe('voting ends soon reminder queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('claimVotingEndsSoonReminders', () => {
    describe('when an active proposal closes within the window', () => {
      let closingSoon: string
      let claimed: string[]

      beforeEach(async () => {
        closingSoon = await insertActive(12 * Time.Hour)
        claimed = await claim()
      })

      it('should return it', () => {
        expect(claimed).toEqual([closingSoon])
      })

      it('should mark it as reminded', async () => {
        expect(await readNotifiedAt(closingSoon)).not.toBeNull()
      })

      it('should not return it again on the next run', async () => {
        expect(await claim()).toEqual([])
      })
    })

    describe('when an active proposal closes after the window', () => {
      beforeEach(async () => {
        await insertActive(2 * Time.Day)
      })

      it('should leave it for a later run', async () => {
        expect(await claim()).toEqual([])
      })
    })

    // A reminder this late would race the finish job.
    describe('when an active proposal closes sooner than the minimum remaining time', () => {
      beforeEach(async () => {
        await insertActive(VOTING_ENDS_SOON_MIN_REMAINING / 2)
      })

      it('should skip it', async () => {
        expect(await claim()).toEqual([])
      })
    })

    describe('when an active proposal has already closed', () => {
      beforeEach(async () => {
        await insertActive(-Time.Minute)
      })

      it('should skip it', async () => {
        expect(await claim()).toEqual([])
      })
    })

    // Its reminder would land right next to the new proposal post.
    describe('when the whole voting period is shorter than the window', () => {
      beforeEach(async () => {
        await insertActive(12 * Time.Hour, { start_at: new Date(Date.now() - 6 * Time.Hour) })
      })

      it('should skip it', async () => {
        expect(await claim()).toEqual([])
      })
    })

    describe('when the proposal is not active', () => {
      beforeEach(async () => {
        await insertActive(12 * Time.Hour, { status: ProposalStatus.Pending })
        await insertActive(12 * Time.Hour, { status: ProposalStatus.Passed })
      })

      it('should skip it', async () => {
        expect(await claim()).toEqual([])
      })
    })

    describe('when the proposal has been deleted', () => {
      beforeEach(async () => {
        await insertActive(12 * Time.Hour, { deleted: true })
      })

      it('should skip it', async () => {
        expect(await claim()).toEqual([])
      })
    })

    // Stands in for the job running on two dynos at once: the other one has claimed the row but not
    // committed yet when this one gets to it.
    describe('when another session claims the proposal first', () => {
      let closingSoon: string
      let claimed: string[]

      beforeEach(async () => {
        closingSoon = await insertActive(12 * Time.Hour)
        const other = new Client({ connectionString: process.env.CONNECTION_STRING })
        await other.connect()
        try {
          await other.query('BEGIN')
          await other.query('UPDATE proposals SET voting_ends_soon_notified_at = now() WHERE id = $1', [closingSoon])
          const pendingClaim = claim()
          await waitUntilBlockedOnARowLock(other)
          await other.query('COMMIT')
          claimed = await pendingClaim
        } finally {
          await other.end()
        }
      })

      it('should not hand it out a second time', () => {
        expect(claimed).toEqual([])
      })
    })
  })

  describe('releaseVotingEndsSoonReminder', () => {
    describe('when a claimed reminder is handed back', () => {
      let closingSoon: string

      beforeEach(async () => {
        closingSoon = await insertActive(12 * Time.Hour)
        await claim()
        await ProposalModel.releaseVotingEndsSoonReminder(closingSoon)
      })

      it('should clear the mark', async () => {
        expect(await readNotifiedAt(closingSoon)).toBeNull()
      })

      it('should let the next run claim it again', async () => {
        expect(await claim()).toEqual([closingSoon])
      })
    })
  })
})
