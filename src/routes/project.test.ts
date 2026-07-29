import { Server } from 'http'
import supertest from 'supertest'

import { ProjectStatus } from '../entities/Grant/types'
import PersonnelModel from '../models/Personnel'
import ProjectLinkModel from '../models/ProjectLink'
import ProjectMilestoneModel from '../models/ProjectMilestone'
import { ProjectService } from '../services/ProjectService'

import project from './project'
import { createTestApp } from './testApp'

const OWNER = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const STRANGER = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
const PROJECT_ID = '00000000-0000-0000-0000-000000000001'
const ENTITY_ID = '00000000-0000-0000-0000-000000000002'

jest.mock('decentraland-gatsby/dist/entities/Auth/middleware', () => ({
  auth:
    (options?: { optional?: boolean }) =>
    (
      req: { get: (name: string) => string | undefined; auth?: string },
      res: { status: (code: number) => { json: (body: unknown) => void } },
      next: () => void
    ) => {
      const address = req.get('x-test-auth')
      if (address) {
        req.auth = address
        return next()
      }
      if (options?.optional) {
        return next()
      }
      res.status(401).json({ ok: false, error: 'Unauthorized' })
    },
}))

const PERSONNEL = { project_id: PROJECT_ID, name: 'A member', role: 'Engineer', about: 'About them' }
const LINK = { project_id: PROJECT_ID, label: 'Repository', url: 'https://example.com' }
const MILESTONE = {
  project_id: PROJECT_ID,
  title: 'A milestone',
  description: 'What it delivers',
  delivery_date: '2030-01-01T00:00:00.000Z',
}

// Every write below goes through validateCanEditProject, which is ownership plus a check that the
// project is still editable. Both halves are exercised here; the ownership query itself is covered
// against the database in test/integration/projectAuthorization.test.ts.
describe('the project routes', () => {
  let app: Server
  let isAuthorOrCoauthor: jest.SpyInstance

  beforeEach(() => {
    app = createTestApp(project)
    isAuthorOrCoauthor = jest.spyOn(ProjectService, 'isAuthorOrCoauthor').mockResolvedValue(true)
    jest
      .spyOn(ProjectService, 'getUpdatedProject')
      .mockResolvedValue({ id: PROJECT_ID, status: ProjectStatus.InProgress } as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('the routes that add to a project', () => {
    const cases = [
      { path: '/api/projects/personnel/', body: { personnel: PERSONNEL }, method: 'addPersonnel' as const },
      { path: '/api/projects/links/', body: { project_link: LINK }, method: 'addLink' as const },
      { path: '/api/projects/milestones/', body: { milestone: MILESTONE }, method: 'addMilestone' as const },
    ]

    describe('when the caller is unauthenticated', () => {
      let statuses: number[]

      beforeEach(async () => {
        const responses = await Promise.all(cases.map(({ path, body }) => supertest(app).post(path).send(body)))
        statuses = responses.map((response) => response.status)
      })

      it('should refuse every one with a 401', () => {
        expect(statuses).toEqual(cases.map(() => 401))
      })
    })

    describe('when the caller may not edit the project', () => {
      let statuses: number[]

      beforeEach(async () => {
        isAuthorOrCoauthor.mockResolvedValue(false)
        const responses = await Promise.all(
          cases.map(({ path, body }) => supertest(app).post(path).set('x-test-auth', STRANGER).send(body))
        )
        statuses = responses.map((response) => response.status)
      })

      it('should refuse every one', () => {
        expect(statuses.every((status) => status >= 400)).toBe(true)
      })
    })

    // A finished or revoked project is closed to edits even for its own author.
    describe('when the project is already finished', () => {
      let response: supertest.Response
      let addPersonnel: jest.SpyInstance

      beforeEach(async () => {
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({
          id: PROJECT_ID,
          status: ProjectStatus.Finished,
        })
        addPersonnel = jest.spyOn(ProjectService, 'addPersonnel').mockResolvedValue({} as never)
        response = await supertest(app)
          .post('/api/projects/personnel/')
          .set('x-test-auth', OWNER)
          .send({ personnel: PERSONNEL })
      })

      it('should refuse the edit even though the caller owns it', () => {
        expect(response.status).toBe(400)
      })

      it('should not add anything', () => {
        expect(addPersonnel).not.toHaveBeenCalled()
      })
    })

    describe('when the project has been revoked', () => {
      let response: supertest.Response

      beforeEach(async () => {
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({
          id: PROJECT_ID,
          status: ProjectStatus.Revoked,
        })
        response = await supertest(app)
          .post('/api/projects/personnel/')
          .set('x-test-auth', OWNER)
          .send({ personnel: PERSONNEL })
      })

      it('should refuse the edit', () => {
        expect(response.status).toBe(400)
      })
    })

    describe('when the owner adds personnel to an editable project', () => {
      let addPersonnel: jest.SpyInstance

      beforeEach(async () => {
        addPersonnel = jest.spyOn(ProjectService, 'addPersonnel').mockResolvedValue({} as never)
        await supertest(app).post('/api/projects/personnel/').set('x-test-auth', OWNER).send({ personnel: PERSONNEL })
      })

      it('should check ownership against the authenticated address', () => {
        expect(isAuthorOrCoauthor).toHaveBeenCalledWith(OWNER, PROJECT_ID)
      })

      it('should record the addition against that address', () => {
        expect(addPersonnel).toHaveBeenCalledWith(expect.anything(), OWNER)
      })
    })

    describe('when the body does not match the schema', () => {
      let response: supertest.Response
      let addLink: jest.SpyInstance

      beforeEach(async () => {
        addLink = jest.spyOn(ProjectService, 'addLink').mockResolvedValue({} as never)
        response = await supertest(app)
          .post('/api/projects/links/')
          .set('x-test-auth', OWNER)
          .send({ project_link: { project_id: PROJECT_ID, label: 'Repository' } })
      })

      it('should reject it', () => {
        expect(response.status).toBe(400)
      })

      it('should not store anything', () => {
        expect(addLink).not.toHaveBeenCalled()
      })
    })
  })

  describe('the routes that delete from a project', () => {
    // Ownership is checked against the project the entity belongs to, which is read from the stored
    // row rather than taken from the request.
    const cases = [
      {
        name: 'personnel',
        path: `/api/projects/personnel/${ENTITY_ID}`,
        model: PersonnelModel,
        service: 'deletePersonnel' as const,
      },
      {
        name: 'link',
        path: `/api/projects/links/${ENTITY_ID}`,
        model: ProjectLinkModel,
        service: 'deleteLink' as const,
      },
      {
        name: 'milestone',
        path: `/api/projects/milestones/${ENTITY_ID}`,
        model: ProjectMilestoneModel,
        service: 'deleteMilestone' as const,
      },
    ]

    cases.forEach(({ name, path, model, service }) => {
      describe(`when deleting a ${name}`, () => {
        let remove: jest.SpyInstance
        let findOne: jest.SpyInstance
        let response: supertest.Response

        beforeEach(() => {
          findOne = jest.spyOn(model, 'findOne').mockResolvedValue({ id: ENTITY_ID, project_id: PROJECT_ID } as never)
          remove = jest.spyOn(ProjectService, service).mockResolvedValue(ENTITY_ID as never)
        })

        describe('and the caller is unauthenticated', () => {
          beforeEach(async () => {
            response = await supertest(app).delete(path)
          })

          it('should respond with a 401', () => {
            expect(response.status).toBe(401)
          })

          it('should not delete it', () => {
            expect(remove).not.toHaveBeenCalled()
          })
        })

        describe('and the caller may not edit the project it belongs to', () => {
          beforeEach(async () => {
            isAuthorOrCoauthor.mockResolvedValue(false)
            response = await supertest(app).delete(path).set('x-test-auth', STRANGER)
          })

          it('should refuse the request', () => {
            expect(response.status).toBeGreaterThanOrEqual(400)
          })

          it('should not delete it', () => {
            expect(remove).not.toHaveBeenCalled()
          })
        })

        describe('and it does not exist', () => {
          beforeEach(async () => {
            findOne.mockResolvedValue(undefined)
            response = await supertest(app).delete(path).set('x-test-auth', OWNER)
          })

          it('should respond with a 404', () => {
            expect(response.status).toBe(404)
          })

          it('should not check ownership against a project it never found', () => {
            expect(isAuthorOrCoauthor).not.toHaveBeenCalled()
          })
        })

        describe('and the id is not a uuid', () => {
          beforeEach(async () => {
            response = await supertest(app).delete(path.replace(ENTITY_ID, 'not-a-uuid')).set('x-test-auth', OWNER)
          })

          it('should respond with a 400', () => {
            expect(response.status).toBe(400)
          })

          it('should not look it up', () => {
            expect(findOne).not.toHaveBeenCalled()
          })
        })

        describe('and the owner deletes it', () => {
          beforeEach(async () => {
            response = await supertest(app).delete(path).set('x-test-auth', OWNER)
          })

          it('should check ownership against the project the row belongs to', () => {
            expect(isAuthorOrCoauthor).toHaveBeenCalledWith(OWNER, PROJECT_ID)
          })

          it('should delete it', () => {
            expect(remove).toHaveBeenCalled()
          })
        })
      })
    })
  })

  describe('GET /api/projects/:project', () => {
    let response: supertest.Response

    describe('when the id is not a uuid', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/projects/not-a-uuid')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })
    })

    describe('when the project does not exist', () => {
      beforeEach(async () => {
        ;(ProjectService.getUpdatedProject as jest.Mock).mockRejectedValue(new Error('missing'))
        response = await supertest(app).get(`/api/projects/${PROJECT_ID}`)
      })

      it('should respond with a 404', () => {
        expect(response.status).toBe(404)
      })
    })

    describe('when the project exists', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/projects/${PROJECT_ID}`)
      })

      it('should return it without requiring authentication', () => {
        expect(response.status).toBe(200)
      })
    })
  })

  describe('GET /api/projects/user/:address', () => {
    let getUserProjects: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getUserProjects = jest.spyOn(ProjectService, 'getUserProjects').mockResolvedValue([] as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/projects/user/not-an-address')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not run the query', () => {
        expect(getUserProjects).not.toHaveBeenCalled()
      })
    })

    describe('when the address is valid', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/projects/user/${OWNER}`)
      })

      it('should query for that address', () => {
        expect(getUserProjects).toHaveBeenCalledWith(OWNER)
      })

      it('should report how many came back', () => {
        expect(response.body.data).toEqual({ data: [], total: 0 })
      })
    })
  })

  describe('GET /api/projects', () => {
    describe('when the range starts after it ends', () => {
      let response: supertest.Response

      beforeEach(async () => {
        jest.spyOn(ProjectService, 'getProjects').mockResolvedValue([] as never)
        response = await supertest(app).get('/api/projects?from=2024-02-01&to=2024-01-01')
      })

      it('should respond with a 400 rather than a server error', () => {
        expect(response.status).toBe(400)
      })
    })
  })
})
