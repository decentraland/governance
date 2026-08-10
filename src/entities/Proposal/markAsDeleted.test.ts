import ProposalModel from './model'
import { ProposalStatus } from './types'
import { DELETABLE_PROPOSAL_STATUSES } from './utils'

const PROPOSAL_ID = '00000000-0000-0000-0000-000000000001'
const AUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const UPDATED_AT = new Date('2026-01-01T00:00:00.000Z')

describe('ProposalModel.markAsDeleted', () => {
  let namedRowCount: jest.SpyInstance
  let queryText: string
  let queryValues: unknown[]

  function captureQuery(rowCount: number) {
    namedRowCount = jest.spyOn(ProposalModel, 'namedRowCount').mockImplementation(async (_name, query) => {
      queryText = query.text.replace(/\s+/g, ' ').trim()
      queryValues = query.values
      return rowCount
    })
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // The caller authorised the removal against a status it read earlier, so the same rule has to hold
  // as a condition on the write: a job can move the proposal to passed or enacted in between.
  describe('when the allowed statuses are given, as they are for the author path', () => {
    beforeEach(async () => {
      captureQuery(1)
      await ProposalModel.markAsDeleted(PROPOSAL_ID, AUTHOR, UPDATED_AT, DELETABLE_PROPOSAL_STATUSES)
    })

    it('should constrain the update to those statuses', () => {
      expect(queryText).toMatch(/AND "status" IN \(\$\d+, \$\d+\)/)
    })

    it('should bind the statuses rather than interpolate them', () => {
      expect(queryValues).toEqual(expect.arrayContaining([ProposalStatus.Active, ProposalStatus.Pending]))
    })

    it('should target the proposal by id', () => {
      expect(queryText).toMatch(/WHERE "id" = \$\d+/)
    })

    it('should skip a proposal that is already deleted', () => {
      expect(queryText).toContain('AND "deleted" = FALSE')
    })

    it('should record who removed it', () => {
      expect(queryValues).toEqual(expect.arrayContaining([AUTHOR, UPDATED_AT, ProposalStatus.Deleted, PROPOSAL_ID]))
    })
  })

  describe('and no allowed statuses are given, as for the council path', () => {
    beforeEach(async () => {
      captureQuery(1)
      await ProposalModel.markAsDeleted(PROPOSAL_ID, AUTHOR, UPDATED_AT)
    })

    it('should not constrain the update on status', () => {
      expect(queryText).not.toContain('AND "status" IN')
    })
  })

  describe('when the update matches a row', () => {
    let result: boolean

    beforeEach(async () => {
      captureQuery(1)
      result = await ProposalModel.markAsDeleted(PROPOSAL_ID, AUTHOR, UPDATED_AT, DELETABLE_PROPOSAL_STATUSES)
    })

    it('should report that the proposal was removed', () => {
      expect(result).toBe(true)
    })
  })

  // The caller destroys the forum topic and the snapshot proposal only on a true answer, so a write
  // that matched nothing has to be distinguishable from one that did.
  describe('and the update matches no row because the status moved on', () => {
    let result: boolean

    beforeEach(async () => {
      captureQuery(0)
      result = await ProposalModel.markAsDeleted(PROPOSAL_ID, AUTHOR, UPDATED_AT, DELETABLE_PROPOSAL_STATUSES)
    })

    it('should report that nothing was removed', () => {
      expect(result).toBe(false)
    })

    it('should not retry the update', () => {
      expect(namedRowCount).toHaveBeenCalledTimes(1)
    })
  })
})
