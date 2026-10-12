import database from 'decentraland-gatsby/dist/entities/Database/database'
import { Client } from 'pg'

import DiscordChannelPostModel, { DiscordChannelPostStatus } from '../../src/models/DiscordChannelPost'
import type { ChannelMessage } from '../../src/services/discord'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'

// Only the discord service's types are used; keep its runtime stack out of the suite.
jest.mock('../../src/services/discord', () => ({ DiscordService: {} }))

function message(title: string): ChannelMessage {
  return { title, fields: [{ name: 'Result', value: 'Yes' }], action: 'Proposal has ended', color: 0x8142f5 }
}

async function readPost(id: string) {
  const rows = await database.query('SELECT * FROM discord_channel_posts WHERE id = $1', [id])
  return rows[0]
}

async function setColumns(id: string, sql: string) {
  await database.query(`UPDATE discord_channel_posts SET ${sql} WHERE id = $1`, [id])
}

describe('discord channel post queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('enqueue', () => {
    describe('when a message is queued', () => {
      let id: string

      beforeEach(async () => {
        id = await DiscordChannelPostModel.enqueue(message('Ban the name test'))
      })

      it('should store the message as it was given', async () => {
        expect((await readPost(id)).message).toEqual(message('Ban the name test'))
      })

      it('should leave it pending', async () => {
        expect((await readPost(id)).status).toBe(DiscordChannelPostStatus.Pending)
      })

      it('should make it due right away', async () => {
        const claimed = await DiscordChannelPostModel.claimDue(10)
        expect(claimed.map((post) => post.id)).toEqual([id])
      })
    })
  })

  describe('claimDue', () => {
    describe('when posts are claimed', () => {
      let first: string
      let second: string

      beforeEach(async () => {
        first = await DiscordChannelPostModel.enqueue(message('first'))
        second = await DiscordChannelPostModel.enqueue(message('second'))
        await setColumns(first, `created_at = now() - interval '1 minute'`)
      })

      it('should hand them out oldest first', async () => {
        expect((await DiscordChannelPostModel.claimDue(10)).map((post) => post.id)).toEqual([first, second])
      })

      it('should count the attempt', async () => {
        await DiscordChannelPostModel.claimDue(10)
        expect((await readPost(first)).attempts).toBe(1)
      })

      it('should mark them as being sent', async () => {
        await DiscordChannelPostModel.claimDue(10)
        expect((await readPost(first)).status).toBe(DiscordChannelPostStatus.Sending)
      })

      it('should not hand them out again', async () => {
        await DiscordChannelPostModel.claimDue(10)
        expect(await DiscordChannelPostModel.claimDue(10)).toEqual([])
      })

      it('should hand out no more than the limit', async () => {
        expect((await DiscordChannelPostModel.claimDue(1)).map((post) => post.id)).toEqual([first])
      })
    })

    describe('when a post is waiting for a later retry', () => {
      beforeEach(async () => {
        const id = await DiscordChannelPostModel.enqueue(message('later'))
        await setColumns(id, `next_attempt_at = now() + interval '5 minutes'`)
      })

      it('should not hand it out yet', async () => {
        expect(await DiscordChannelPostModel.claimDue(10)).toEqual([])
      })
    })

    describe('when posts are already sent or failed', () => {
      beforeEach(async () => {
        const sent = await DiscordChannelPostModel.enqueue(message('sent'))
        const failed = await DiscordChannelPostModel.enqueue(message('failed'))
        await setColumns(sent, `status = '${DiscordChannelPostStatus.Sent}'`)
        await setColumns(failed, `status = '${DiscordChannelPostStatus.Failed}'`)
      })

      it('should not hand them out', async () => {
        expect(await DiscordChannelPostModel.claimDue(10)).toEqual([])
      })
    })

    // Stands in for a second instance claiming at the same moment: the rows it holds are skipped
    // rather than waited on, and never handed out twice.
    describe('when another session is claiming the same post', () => {
      let held: string
      let free: string
      let claimed: string[]

      beforeEach(async () => {
        held = await DiscordChannelPostModel.enqueue(message('held'))
        free = await DiscordChannelPostModel.enqueue(message('free'))
        const other = new Client({ connectionString: process.env.CONNECTION_STRING })
        await other.connect()
        try {
          await other.query('BEGIN')
          await other.query('SELECT id FROM discord_channel_posts WHERE id = $1 FOR UPDATE', [held])
          claimed = (await DiscordChannelPostModel.claimDue(10)).map((post) => post.id)
          await other.query('COMMIT')
        } finally {
          await other.end()
        }
      })

      it('should hand out only the post nobody else holds', () => {
        expect(claimed).toEqual([free])
      })
    })
  })

  describe('recording the outcome', () => {
    let id: string

    beforeEach(async () => {
      id = await DiscordChannelPostModel.enqueue(message('post'))
      await DiscordChannelPostModel.claimDue(10)
    })

    describe('when a post went out', () => {
      beforeEach(async () => {
        await DiscordChannelPostModel.markSent(id)
      })

      it('should mark it as sent', async () => {
        expect((await readPost(id)).status).toBe(DiscordChannelPostStatus.Sent)
      })
    })

    describe('when a post is put back for a retry', () => {
      let nextAttemptAt: Date

      beforeEach(async () => {
        nextAttemptAt = new Date(Date.now() + 2 * 60 * 1000)
        await DiscordChannelPostModel.retryLater(id, 'Error: Service Unavailable', nextAttemptAt)
      })

      it('should make it pending again', async () => {
        expect((await readPost(id)).status).toBe(DiscordChannelPostStatus.Pending)
      })

      it('should keep the error', async () => {
        expect((await readPost(id)).error).toBe('Error: Service Unavailable')
      })

      it('should not hand it out before the next attempt is due', async () => {
        expect(await DiscordChannelPostModel.claimDue(10)).toEqual([])
      })

      it('should hand it out once it is due', async () => {
        await setColumns(id, `next_attempt_at = now() - interval '1 second'`)
        expect((await DiscordChannelPostModel.claimDue(10)).map((post) => post.attempts)).toEqual([2])
      })
    })

    describe('when a post is given up on', () => {
      beforeEach(async () => {
        await DiscordChannelPostModel.markFailed(id, 'Error: Missing Access')
      })

      it('should mark it as failed with the reason', async () => {
        expect(await readPost(id)).toEqual(
          expect.objectContaining({ status: DiscordChannelPostStatus.Failed, error: 'Error: Missing Access' })
        )
      })
    })

    // Only the run holding the claim may settle it.
    describe('when the post is not being sent', () => {
      beforeEach(async () => {
        await DiscordChannelPostModel.markSent(id)
      })

      it('should leave a later outcome unrecorded', async () => {
        expect(await DiscordChannelPostModel.retryLater(id, 'late', new Date())).toBe(0)
      })
    })
  })
})
