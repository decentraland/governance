import database from 'decentraland-gatsby/dist/entities/Database/database'
import { Client } from 'pg'

import ForumTopicNotificationModel from '../../src/models/ForumTopicNotification'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'

const GOVERNANCE = 13
const REGENESIS_LABS = 18

// Without this the commit could reach the server before the claim does, and the test would pass
// without ever exercising the claim waiting on the other session's insert.
async function waitUntilBlockedOnALock(observer: Client) {
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
  throw new Error('The claim never waited on the other session')
}

async function readCategory(topicId: number): Promise<number | undefined> {
  const rows = await database.query('SELECT category_id FROM forum_topic_notifications WHERE topic_id = $1', [topicId])
  return rows[0]?.category_id
}

describe('forum topic notification queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('claim', () => {
    describe('when no topic is given', () => {
      it('should claim nothing', async () => {
        expect(await ForumTopicNotificationModel.claim([])).toEqual([])
      })
    })

    describe('when the topics have not been seen before', () => {
      let claimed: number[]

      beforeEach(async () => {
        claimed = await ForumTopicNotificationModel.claim([
          { id: 25466, category_id: GOVERNANCE },
          { id: 25456, category_id: REGENESIS_LABS },
        ])
      })

      it('should claim all of them', () => {
        expect(claimed.sort()).toEqual([25456, 25466])
      })

      it('should record the category of each', async () => {
        expect(await readCategory(25456)).toBe(REGENESIS_LABS)
      })

      it('should not claim them again on the next run', async () => {
        expect(
          await ForumTopicNotificationModel.claim([
            { id: 25466, category_id: GOVERNANCE },
            { id: 25456, category_id: REGENESIS_LABS },
          ])
        ).toEqual([])
      })
    })

    describe('when only some of the topics are new', () => {
      let claimed: number[]

      beforeEach(async () => {
        await ForumTopicNotificationModel.claim([{ id: 25456, category_id: REGENESIS_LABS }])
        claimed = await ForumTopicNotificationModel.claim([
          { id: 25456, category_id: REGENESIS_LABS },
          { id: 25466, category_id: GOVERNANCE },
        ])
      })

      it('should claim only the new one', () => {
        expect(claimed).toEqual([25466])
      })
    })

    // Stands in for the job running on two instances at once: the other one has inserted the topic but
    // not committed yet when this one gets to it.
    describe('when another session claims the topic first', () => {
      let claimed: number[]

      beforeEach(async () => {
        const other = new Client({ connectionString: process.env.CONNECTION_STRING })
        await other.connect()
        try {
          await other.query('BEGIN')
          await other.query('INSERT INTO forum_topic_notifications (topic_id, category_id) VALUES ($1, $2)', [
            25466,
            GOVERNANCE,
          ])
          const pendingClaim = ForumTopicNotificationModel.claim([{ id: 25466, category_id: GOVERNANCE }])
          await waitUntilBlockedOnALock(other)
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

  describe('release', () => {
    describe('when a claimed topic is handed back', () => {
      beforeEach(async () => {
        await ForumTopicNotificationModel.claim([{ id: 25466, category_id: GOVERNANCE }])
        await ForumTopicNotificationModel.release(25466)
      })

      it('should let the next run claim it again', async () => {
        expect(await ForumTopicNotificationModel.claim([{ id: 25466, category_id: GOVERNANCE }])).toEqual([25466])
      })
    })
  })
})
