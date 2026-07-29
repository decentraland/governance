import { randomUUID } from 'crypto'

import { CoauthorStatus } from '../../src/entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import ProjectModel from '../../src/models/Project'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertCoauthor, insertProject, insertProposalWith } from '../setup/factories'

const AUTHOR = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const COAUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const STRANGER = '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f'

// Every write route on a project funnels through this, so what it answers decides who may add or
// remove personnel, links and milestones. It is a single sql statement, so only a database can say
// what it really returns.
describe('ProjectModel.isAuthorOrCoauthor', () => {
  let projectId: string
  let proposalId: string

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
    const proposal = await insertProposalWith({
      id: randomUUID(),
      type: ProposalType.Grant,
      status: ProposalStatus.Enacted,
      user: AUTHOR,
    })
    proposalId = proposal.id
    projectId = await insertProject(proposalId)
  })

  describe('when the caller authored the proposal behind the project', () => {
    it('should allow them', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(AUTHOR, projectId)).toBe(true)
    })
  })

  describe('when the caller is an accepted coauthor', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.APPROVED)
    })

    it('should allow them', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(COAUTHOR, projectId)).toBe(true)
    })
  })

  // An invitation that has not been accepted confers nothing yet.
  describe('when the caller was invited but has not accepted', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.PENDING)
    })

    it('should refuse them', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(COAUTHOR, projectId)).toBe(false)
    })
  })

  describe('when the caller declined the invitation', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.REJECTED)
    })

    it('should refuse them', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(COAUTHOR, projectId)).toBe(false)
    })
  })

  describe('when the caller has no relationship to the project', () => {
    it('should refuse them', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(STRANGER, projectId)).toBe(false)
    })
  })

  // The join is anchored on the project id, so a coauthor of a different proposal must not carry
  // over to this one.
  describe('when the caller is an accepted coauthor of a different project', () => {
    beforeEach(async () => {
      const otherProposal = await insertProposalWith({ id: randomUUID(), user: STRANGER })
      await insertProject(otherProposal.id)
      await insertCoauthor(otherProposal.id, COAUTHOR, CoauthorStatus.APPROVED)
    })

    it('should refuse them on this project', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(COAUTHOR, projectId)).toBe(false)
    })
  })

  describe('when the project does not exist', () => {
    it('should refuse rather than allow an unknown project', async () => {
      expect(await ProjectModel.isAuthorOrCoauthor(AUTHOR, randomUUID())).toBe(false)
    })
  })

  describe('when the project id is not a uuid', () => {
    it('should refuse before querying', async () => {
      await expect(ProjectModel.isAuthorOrCoauthor(AUTHOR, 'not-a-uuid')).rejects.toThrow('Invalid project id')
    })
  })

  describe('when the caller is not an address', () => {
    it('should refuse before querying', async () => {
      await expect(ProjectModel.isAuthorOrCoauthor('not-an-address', projectId)).rejects.toThrow('Invalid user')
    })
  })

  // The comparison is exact, unlike the coauthor filters elsewhere which lower() both sides. These
  // record what the statement actually does for an address that differs only in case.
  describe('when the caller’s address differs in case from the stored author', () => {
    it('should report what the exact comparison yields', async () => {
      const checksummed = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
      expect(await ProjectModel.isAuthorOrCoauthor(checksummed, projectId)).toBe(false)
    })
  })

  describe('when the caller’s address differs in case from the stored coauthor', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.APPROVED)
    })

    it('should report what the exact comparison yields', async () => {
      const checksummed = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
      expect(await ProjectModel.isAuthorOrCoauthor(checksummed, projectId)).toBe(false)
    })
  })
})
