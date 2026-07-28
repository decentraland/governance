import { randomUUID } from 'crypto'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { NewGrantCategory } from '../../src/entities/Grant/types'
import { asNumber } from '../../src/entities/Proposal/utils'
import QuarterBudgetModel from '../../src/entities/QuarterBudget/model'
import QuarterCategoryBudgetModel from '../../src/entities/QuarterCategoryBudget/model'
import { closeLockPool, withPgAdvisoryLock } from '../../src/jobs/jobLocks'
import { BudgetService } from '../../src/services/BudgetService'
import { withTransaction } from '../../src/utils/withTransaction'
import { closeTestDb, initTestDb } from '../setup/db'

const CATEGORY = NewGrantCategory.Platform
const CATEGORY_TOTAL = 100000

type CategoryRow = { total: number; allocated: number }

async function insertQuarterBudget(): Promise<string> {
  const id = randomUUID()
  const now = new Date()
  await QuarterBudgetModel.create({
    id,
    start_at: new Date(now.getTime() - 60 * 60 * 1000),
    finish_at: new Date(now.getTime() + 60 * 60 * 1000),
    total: CATEGORY_TOTAL,
    created_at: now,
    updated_at: now,
  })
  await QuarterCategoryBudgetModel.create({
    quarter_budget_id: id,
    category: CATEGORY,
    total: CATEGORY_TOTAL,
    allocated: 0,
    created_at: now,
    updated_at: now,
  })
  return id
}

// The budget columns are numeric, so pg hands them back as strings to preserve precision; the
// production read path funnels them through asNumber for the same reason.
async function readCategoryBudget(quarterBudgetId: string): Promise<CategoryRow | undefined> {
  const rows = await QuarterCategoryBudgetModel.namedQuery<{ total: string; allocated: string }>(
    'test_read_category_budget',
    SQL`SELECT total, allocated FROM ${table(QuarterCategoryBudgetModel)}
        WHERE quarter_budget_id = ${quarterBudgetId} AND category = ${CATEGORY}`
  )
  const row = rows[0]
  return row && { total: asNumber(row.total), allocated: asNumber(row.allocated) }
}

// Mirrors what the finish job persists: BudgetService turns an in-memory budget into UPDATE
// statements and they are applied inside one transaction.
async function applyAllocation(quarterBudgetId: string, allocated: number): Promise<void> {
  const queries = BudgetService.getBudgetUpdateQueries([
    {
      id: quarterBudgetId,
      total: CATEGORY_TOTAL,
      allocated,
      start_at: new Date(),
      finish_at: new Date(),
      categories: { platform: { total: CATEGORY_TOTAL, allocated, available: CATEGORY_TOTAL - allocated } },
    } as never,
  ])
  await withTransaction(async (client) => {
    for (const query of queries) {
      await client.query(query.text, query.values)
    }
  })
}

// Faithful to the finish job: read the current allocation outside the transaction, accumulate the
// grant in memory, then write the resulting absolute value. Two runs that interleave here both read
// the same starting point, so the later write silently drops the earlier grant.
async function allocateGrant(quarterBudgetId: string, grantSize: number): Promise<void> {
  const current = await readCategoryBudget(quarterBudgetId)
  await applyAllocation(quarterBudgetId, (current?.allocated ?? 0) + grantSize)
}

describe('budget allocation', () => {
  let quarterBudgetId: string
  let context: JobContext

  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeLockPool()
    await closeTestDb()
  })

  beforeEach(async () => {
    quarterBudgetId = await insertQuarterBudget()
    context = new JobContext(
      'id',
      'handler',
      {},
      async () => {},
      async () => {}
    )
  })

  afterEach(async () => {
    await QuarterCategoryBudgetModel.delete({ quarter_budget_id: quarterBudgetId })
    await QuarterBudgetModel.delete({ id: quarterBudgetId })
    jest.clearAllMocks()
  })

  describe('when a single allocation is applied', () => {
    beforeEach(async () => {
      await applyAllocation(quarterBudgetId, 40000)
    })

    it('should persist the allocated amount', async () => {
      expect((await readCategoryBudget(quarterBudgetId))?.allocated).toBe(40000)
    })

    it('should leave the category total untouched', async () => {
      expect((await readCategoryBudget(quarterBudgetId))?.total).toBe(CATEGORY_TOTAL)
    })
  })

  // The write is an absolute SET of a value computed from a read taken earlier, outside the
  // transaction. Two runs that both read allocated=0 therefore overwrite each other instead of
  // accumulating, which is exactly why the finish job has to be serialized by an advisory lock.
  // If this is ever changed to an accumulating write, this expectation should change with it.
  describe('when two allocations derived from the same stale read are applied in sequence', () => {
    beforeEach(async () => {
      await applyAllocation(quarterBudgetId, 40000)
      await applyAllocation(quarterBudgetId, 30000)
    })

    it('should overwrite rather than accumulate, losing the first allocation', async () => {
      expect((await readCategoryBudget(quarterBudgetId))?.allocated).toBe(30000)
    })
  })

  describe('when grants are allocated one after another', () => {
    beforeEach(async () => {
      await allocateGrant(quarterBudgetId, 60000)
      await allocateGrant(quarterBudgetId, 30000)
    })

    it('should accumulate both grants when the runs do not overlap', async () => {
      expect((await readCategoryBudget(quarterBudgetId))?.allocated).toBe(90000)
    })
  })

  describe('when two lock-guarded runs allocate concurrently', () => {
    let firstJob: jest.Mock
    let secondJob: jest.Mock

    beforeEach(async () => {
      let allowFirstToFinish: () => void = () => undefined
      const firstMayFinish = new Promise<void>((resolve) => {
        allowFirstToFinish = resolve
      })
      let markFirstAsRunning: () => void = () => undefined
      const firstIsRunning = new Promise<void>((resolve) => {
        markFirstAsRunning = resolve
      })

      // The holder allocates first and then keeps the lock, so if the guard ever stopped working the
      // overlapping run would allocate on top of this and the stored total would change.
      firstJob = jest.fn().mockImplementation(async () => {
        await allocateGrant(quarterBudgetId, 60000)
        markFirstAsRunning()
        await firstMayFinish
      })
      secondJob = jest.fn().mockImplementation(async () => {
        await allocateGrant(quarterBudgetId, 30000)
      })

      const firstRun = withPgAdvisoryLock('finishProposalBudgetTest', firstJob)(context)
      await firstIsRunning
      await withPgAdvisoryLock('finishProposalBudgetTest', secondJob)(context)
      allowFirstToFinish()
      await firstRun
    })

    it('should skip the overlapping run instead of letting it allocate from a stale read', () => {
      expect(secondJob).not.toHaveBeenCalled()
    })

    it('should persist only the allocation of the run that held the lock', async () => {
      expect((await readCategoryBudget(quarterBudgetId))?.allocated).toBe(60000)
    })
  })

  describe('when the transaction applying an allocation fails', () => {
    beforeEach(async () => {
      await withTransaction(async (client) => {
        const queries = BudgetService.getBudgetUpdateQueries([
          {
            id: quarterBudgetId,
            total: CATEGORY_TOTAL,
            allocated: 90000,
            start_at: new Date(),
            finish_at: new Date(),
            categories: { platform: { total: CATEGORY_TOTAL, allocated: 90000, available: 10000 } },
          } as never,
        ])
        for (const query of queries) {
          await client.query(query.text, query.values)
        }
        throw new Error('forced failure')
      }).catch(() => undefined)
    })

    it('should roll the allocation back rather than commit a partial budget', async () => {
      expect((await readCategoryBudget(quarterBudgetId))?.allocated).toBe(0)
    })
  })
})
