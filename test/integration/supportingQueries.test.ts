import { randomUUID } from 'crypto'

import { ProposalStatus } from '../../src/entities/Proposal/types'
import { FinancialRecordCateogry, UpdateStatus } from '../../src/entities/Updates/types'
import VotesModel from '../../src/entities/Votes/model'
import AirdropJobModel from '../../src/models/AirdropJob'
import FinancialModel from '../../src/models/Financial'
import { AirdropJobStatus } from '../../src/types/AirdropJob'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProject, insertProposalWith, insertUpdate } from '../setup/factories'

const RECIPIENT = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'

describe('VotesModel', () => {
  let proposalId: string
  let otherProposalId: string

  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  beforeEach(async () => {
    proposalId = (await insertProposalWith({ id: randomUUID() })).id
    otherProposalId = (await insertProposalWith({ id: randomUUID() })).id
  })

  describe('createEmpty', () => {
    describe('when a proposal gets its vote row', () => {
      beforeEach(async () => {
        await VotesModel.createEmpty(proposalId)
      })

      it('should be readable back', async () => {
        expect(await VotesModel.getVotes(proposalId)).not.toBeNull()
      })

      it('should start with no votes recorded', async () => {
        const stored = await VotesModel.getVotes(proposalId)
        expect(stored?.votes).toEqual({})
      })
    })
  })

  describe('getVotes', () => {
    describe('when the proposal has no vote row', () => {
      it('should return nothing rather than an empty row', async () => {
        expect(await VotesModel.getVotes(randomUUID())).toBeNull()
      })
    })
  })

  describe('findAny', () => {
    beforeEach(async () => {
      await VotesModel.createEmpty(proposalId)
      await VotesModel.createEmpty(otherProposalId)
    })

    describe('when several proposals are asked about', () => {
      it('should return a row for each', async () => {
        expect(await VotesModel.findAny([proposalId, otherProposalId])).toHaveLength(2)
      })
    })

    describe('when one of the ids has no row', () => {
      it('should return only the ones that do', async () => {
        const found = await VotesModel.findAny([proposalId, randomUUID()])
        expect(found.map((v) => v.proposal_id)).toEqual([proposalId])
      })
    })

    describe('when no ids are given', () => {
      it('should return nothing without querying', async () => {
        expect(await VotesModel.findAny([])).toEqual([])
      })
    })
  })
})

describe('FinancialModel', () => {
  let updateId: string

  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  beforeEach(async () => {
    const proposal = await insertProposalWith({ id: randomUUID(), status: ProposalStatus.Enacted })
    const projectId = await insertProject(proposal.id)
    const update = await insertUpdate(proposal.id, projectId, UpdateStatus.Done)
    updateId = update.id
    // Written through the real insert: the id column is a serial, not a uuid, and the token is
    // uppercased on the way in.
    await FinancialModel.createRecords(updateId, [
      {
        category: FinancialRecordCateogry.Other,
        description: 'A cost',
        amount: 1234.56,
        token: 'mana',
        receiver: RECIPIENT,
        link: 'https://example.com',
      },
    ] as never)
  })

  describe('getRecords', () => {
    describe('when the update has records', () => {
      it('should return them', async () => {
        expect(await FinancialModel.getRecords(updateId)).toHaveLength(1)
      })

      // The column is numeric, which the driver hands back as a string, so the read parses it.
      it('should return the amount as a number rather than a string', async () => {
        const [record] = await FinancialModel.getRecords(updateId)
        expect(record.amount).toBe(1234.56)
      })

      it('should uppercase the token the insert stored', async () => {
        const [record] = await FinancialModel.getRecords(updateId)
        expect(record.token).toBe('MANA')
      })
    })

    describe('when the update has no records', () => {
      it('should return nothing', async () => {
        expect(await FinancialModel.getRecords(randomUUID())).toEqual([])
      })
    })
  })

  describe('getAllRecords', () => {
    describe('when the page size is beyond what is allowed', () => {
      it('should refuse rather than read the table', async () => {
        await expect(FinancialModel.getAllRecords(0, 101)).rejects.toThrow('page_size')
      })
    })

    describe('when the paging arguments are negative', () => {
      it('should refuse', async () => {
        await expect(FinancialModel.getAllRecords(-1, 10)).rejects.toThrow('Invalid page_number')
      })
    })

    describe('when the paging arguments are valid', () => {
      it('should return the stored record', async () => {
        expect(await FinancialModel.getAllRecords(0, 10)).toHaveLength(1)
      })
    })
  })
})

describe('AirdropJobModel', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  beforeEach(async () => {
    await AirdropJobModel.create({
      id: randomUUID(),
      badge_spec: 'a-badge-spec',
      recipients: [RECIPIENT],
      status: AirdropJobStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date(),
    })
    await AirdropJobModel.create({
      id: randomUUID(),
      badge_spec: 'another-badge-spec',
      recipients: [RECIPIENT],
      status: AirdropJobStatus.FINISHED,
      created_at: new Date(),
      updated_at: new Date(),
    })
  })

  describe('getPending', () => {
    // The runner acts on what this returns, so a finished job coming back would be re-run.
    it('should return only the jobs still to run', async () => {
      const pending = await AirdropJobModel.getPending()
      expect(pending.map((job) => job.badge_spec)).toEqual(['a-badge-spec'])
    })

    it('should keep the recipient list intact', async () => {
      const [job] = await AirdropJobModel.getPending()
      expect(job.recipients).toEqual([RECIPIENT])
    })
  })

  describe('getAll', () => {
    it('should return the finished jobs as well', async () => {
      expect(await AirdropJobModel.getAll()).toHaveLength(2)
    })
  })
})
