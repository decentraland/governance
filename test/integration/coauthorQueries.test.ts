import { randomUUID } from 'crypto'

import CoauthorModel from '../../src/entities/Coauthor/model'
import { CoauthorStatus } from '../../src/entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import ProjectModel from '../../src/models/Project'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertCoauthor, insertPersonnel, insertProject, insertProposalWith } from '../setup/factories'

const AUTHOR = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const COAUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const STRANGER = '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f'

describe('CoauthorModel', () => {
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
    const proposal = await insertProposalWith({ id: randomUUID(), user: AUTHOR })
    proposalId = proposal.id
  })

  describe('createMultiple', () => {
    describe('when several addresses are invited at once', () => {
      beforeEach(async () => {
        await CoauthorModel.createMultiple(proposalId, [COAUTHOR, STRANGER])
      })

      it('should invite both', async () => {
        expect(await CoauthorModel.findCoauthors(proposalId)).toHaveLength(2)
      })

      // Stored lowercased, which is what lets the case-insensitive lookups elsewhere match.
      it('should store the addresses lowercased', async () => {
        const found = await CoauthorModel.findCoauthors(proposalId)
        expect(found.map((c) => c.address).sort()).toEqual([COAUTHOR, STRANGER].sort())
      })

      it('should leave every invitation pending', async () => {
        const found = await CoauthorModel.findCoauthors(proposalId)
        expect(found.every((c) => c.status === CoauthorStatus.PENDING)).toBe(true)
      })
    })

    describe('when an address is invited in a different case', () => {
      beforeEach(async () => {
        await CoauthorModel.createMultiple(proposalId, [COAUTHOR.toUpperCase().replace('0X', '0x')])
      })

      it('should still store it lowercased', async () => {
        const [found] = await CoauthorModel.findCoauthors(proposalId)
        expect(found.address).toBe(COAUTHOR)
      })
    })
  })

  describe('findCoauthors', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.APPROVED)
      await insertCoauthor(proposalId, STRANGER, CoauthorStatus.PENDING)
    })

    describe('when no status is given', () => {
      it('should return every invitation on the proposal', async () => {
        expect(await CoauthorModel.findCoauthors(proposalId)).toHaveLength(2)
      })
    })

    describe('when a status is given', () => {
      it('should return only invitations in that status', async () => {
        const found = await CoauthorModel.findCoauthors(proposalId, CoauthorStatus.APPROVED)
        expect(found.map((c) => c.address)).toEqual([COAUTHOR])
      })
    })

    describe('when the proposal has no invitations', () => {
      it('should return nothing', async () => {
        expect(await CoauthorModel.findCoauthors(randomUUID())).toEqual([])
      })
    })
  })

  describe('findProposals', () => {
    let otherProposalId: string

    beforeEach(async () => {
      const other = await insertProposalWith({ id: randomUUID(), user: STRANGER })
      otherProposalId = other.id
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.APPROVED)
      await insertCoauthor(otherProposalId, COAUTHOR, CoauthorStatus.PENDING)
      await insertCoauthor(proposalId, STRANGER, CoauthorStatus.APPROVED)
    })

    describe('when an address is looked up', () => {
      it('should return every proposal it was invited to', async () => {
        expect(await CoauthorModel.findProposals(COAUTHOR)).toHaveLength(2)
      })

      it('should not return another address’s invitations', async () => {
        const found = await CoauthorModel.findProposals(COAUTHOR)
        expect(found.every((c) => c.address === COAUTHOR)).toBe(true)
      })
    })

    // The lookup lowers both sides, so a checksummed address still finds its invitations.
    describe('when the address is looked up in a different case', () => {
      it('should still find them', async () => {
        const checksummed = COAUTHOR.toUpperCase().replace('0X', '0x')
        expect(await CoauthorModel.findProposals(checksummed)).toHaveLength(2)
      })
    })

    describe('when a status is given', () => {
      it('should narrow to that status', async () => {
        const found = await CoauthorModel.findProposals(COAUTHOR, CoauthorStatus.PENDING)
        expect(found.map((c) => c.proposal_id)).toEqual([otherProposalId])
      })
    })
  })
})

describe('ProjectModel.getUserProjects', () => {
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

  describe('when the caller authored the proposal', () => {
    it('should return their project', async () => {
      const projects = await ProjectModel.getUserProjects(AUTHOR)
      expect(projects.map((p) => p.id)).toEqual([projectId])
    })
  })

  describe('when the caller is an accepted coauthor', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.APPROVED)
    })

    it('should return the project', async () => {
      expect(await ProjectModel.getUserProjects(COAUTHOR)).toHaveLength(1)
    })
  })

  describe('when the caller was invited but has not accepted', () => {
    beforeEach(async () => {
      await insertCoauthor(proposalId, COAUTHOR, CoauthorStatus.PENDING)
    })

    it('should not return the project yet', async () => {
      expect(await ProjectModel.getUserProjects(COAUTHOR)).toEqual([])
    })
  })

  // Personnel are on the team without being coauthors, so the query reaches a project through them
  // as well. Asserting only that a stranger is refused would pass with the branch removed.
  describe('when the caller is listed as personnel', () => {
    beforeEach(async () => {
      await insertPersonnel(projectId, 'A member', { address: STRANGER })
    })

    it('should return the project for them', async () => {
      expect(await ProjectModel.getUserProjects(STRANGER)).toHaveLength(1)
    })

    it('should still refuse an address that is on no team', async () => {
      expect(await ProjectModel.getUserProjects('0x1111111111111111111111111111111111111111')).toEqual([])
    })
  })

  describe('when the caller was removed from the team', () => {
    beforeEach(async () => {
      await insertPersonnel(projectId, 'A former member', { address: STRANGER, deleted: true })
    })

    it('should no longer return the project for them', async () => {
      expect(await ProjectModel.getUserProjects(STRANGER)).toEqual([])
    })
  })

  describe('when the caller has no relationship to the project', () => {
    it('should return nothing', async () => {
      expect(await ProjectModel.getUserProjects(STRANGER)).toEqual([])
    })
  })

  // Unlike isAuthorOrCoauthor before it was fixed, this query lowers both sides.
  describe('when the caller’s address differs in case', () => {
    it('should still return their project', async () => {
      const checksummed = AUTHOR.toUpperCase().replace('0X', '0x')
      expect(await ProjectModel.getUserProjects(checksummed)).toHaveLength(1)
    })
  })

  describe('when the proposal behind the project is not a grant', () => {
    beforeEach(async () => {
      const poll = await insertProposalWith({ id: randomUUID(), type: ProposalType.Poll, user: AUTHOR })
      await insertProject(poll.id)
    })

    it('should return only the grant project', async () => {
      expect(await ProjectModel.getUserProjects(AUTHOR)).toHaveLength(1)
    })
  })
})
