import { randomUUID } from 'crypto'

import { CoauthorStatus } from '../../src/entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import ProjectModel, { Project } from '../../src/models/Project'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import {
  insertCoauthor,
  insertMilestone,
  insertPersonnel,
  insertProject,
  insertProjectLink,
  insertProposalWith,
} from '../setup/factories'

const AUTHOR = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const APPROVED_COAUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const PENDING_COAUTHOR = '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f'
const VESTING_ADDRESS = '0x1111111111111111111111111111111111111111'

describe('ProjectModel.getProject', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('when the project has related rows of every kind', () => {
    let projectId: string
    let livePersonnel: string
    let deletedPersonnel: string
    let milestoneId: string
    let linkId: string
    let project: Project

    beforeEach(async () => {
      const proposal = await insertProposalWith({
        id: randomUUID(),
        type: ProposalType.Grant,
        status: ProposalStatus.Enacted,
        user: AUTHOR,
        vesting_addresses: [VESTING_ADDRESS],
      })
      projectId = await insertProject(proposal.id)
      livePersonnel = await insertPersonnel(projectId, 'Live member')
      deletedPersonnel = await insertPersonnel(projectId, 'Removed member', true)
      milestoneId = await insertMilestone(projectId, 'First milestone')
      linkId = await insertProjectLink(projectId, 'Repository')
      await insertCoauthor(proposal.id, APPROVED_COAUTHOR, CoauthorStatus.APPROVED)
      await insertCoauthor(proposal.id, PENDING_COAUTHOR, CoauthorStatus.PENDING)
      project = await ProjectModel.getProject(projectId)
    })

    it('should return the project itself', () => {
      expect(project.id).toBe(projectId)
    })

    it('should take the author from the proposal', () => {
      expect(project.author).toBe(AUTHOR)
    })

    it('should take the vesting addresses from the proposal', () => {
      expect(project.vesting_addresses).toEqual([VESTING_ADDRESS])
    })

    it('should aggregate the personnel that is still on the team', () => {
      expect(project.personnel.map((member) => member.id)).toEqual([livePersonnel])
    })

    // The personnel join filters on deleted = false, so a removed member must not reappear.
    it('should leave removed personnel out', () => {
      expect(project.personnel.map((member) => member.id)).not.toContain(deletedPersonnel)
    })

    it('should aggregate the milestones', () => {
      expect(project.milestones.map((milestone) => milestone.id)).toEqual([milestoneId])
    })

    it('should aggregate the links', () => {
      expect(project.links.map((link) => link.id)).toEqual([linkId])
    })

    // Only accepted coauthors are part of the project; a pending invitation is not.
    it('should aggregate only the accepted coauthors', () => {
      expect(project.coauthors).toEqual([APPROVED_COAUTHOR])
    })
  })

  describe('when the project has no related rows', () => {
    let project: Project

    beforeEach(async () => {
      const proposal = await insertProposalWith({ id: randomUUID(), user: AUTHOR })
      const projectId = await insertProject(proposal.id)
      project = await ProjectModel.getProject(projectId)
    })

    // The aggregates are coalesced, so a project with no children reads as empty rather than as a
    // row full of nulls.
    it('should return an empty personnel list', () => {
      expect(project.personnel).toEqual([])
    })

    it('should return an empty milestone list', () => {
      expect(project.milestones).toEqual([])
    })

    it('should return an empty link list', () => {
      expect(project.links).toEqual([])
    })

    it('should return an empty coauthor list', () => {
      expect(project.coauthors).toEqual([])
    })
  })

  describe('when several projects exist', () => {
    let firstProject: string
    let otherPersonnel: string
    let project: Project

    beforeEach(async () => {
      const firstProposal = await insertProposalWith({ id: randomUUID(), user: AUTHOR })
      const otherProposal = await insertProposalWith({ id: randomUUID(), user: AUTHOR })
      firstProject = await insertProject(firstProposal.id)
      const otherProject = await insertProject(otherProposal.id)
      await insertPersonnel(firstProject, 'Own member')
      otherPersonnel = await insertPersonnel(otherProject, 'Someone else')
      project = await ProjectModel.getProject(firstProject)
    })

    it('should not mix in another project’s personnel', () => {
      expect(project.personnel.map((member) => member.id)).not.toContain(otherPersonnel)
    })

    it('should return exactly one member', () => {
      expect(project.personnel).toHaveLength(1)
    })
  })

  describe('when the id is not a uuid', () => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await ProjectModel.getProject('not-a-uuid').catch((error) => error)
    })

    it('should refuse before querying', () => {
      expect(outcome).toBeInstanceOf(Error)
    })
  })

  describe('when no project has that id', () => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await ProjectModel.getProject(randomUUID()).catch((error) => error)
    })

    it('should raise a not found error', () => {
      expect(outcome).toBeInstanceOf(Error)
    })
  })
})
