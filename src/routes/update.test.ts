import { Server } from 'http'
import supertest from 'supertest'

import { ProjectService } from '../services/ProjectService'
import { UpdateService } from '../services/update'
import * as validations from '../utils/validations'

import { createTestApp } from './testApp'
import update from './update'

const AUTHOR = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const COAUTHOR = '0x4Fc4dE7CD3F8f04F2c9d61A0b1b0A08D5F0e6b3A'
const STRANGER = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
const PROJECT_ID = '00000000-0000-0000-0000-000000000002'
const UPDATE_ID = '00000000-0000-0000-0000-000000000003'

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

const VALID_BODY = {
  health: 'onTrack',
  introduction: 'An introduction long enough to pass',
  highlights: 'Some highlights',
  blockers: 'No blockers',
  next_steps: 'The next steps',
  additional_notes: 'Notes',
}

// The edit route also parses the financial section, which is nullable but not optional, so the
// field has to be present even when there is nothing to report.
const VALID_PATCH_BODY = { ...VALID_BODY, financial_records: null }

describe('the project update routes', () => {
  let app: Server
  let isAuthorOrCoauthor: jest.SpyInstance

  beforeEach(() => {
    app = createTestApp(update)
    jest
      .spyOn(ProjectService, 'getUpdatedProject')
      .mockResolvedValue({ id: PROJECT_ID, proposal_id: 'proposal', vesting_addresses: [] } as never)
    // The route reaches ownership through this helper; letting it run real keeps the check itself
    // in play while its data source is stubbed.
    isAuthorOrCoauthor = jest.spyOn(ProjectService, 'isAuthorOrCoauthor').mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/updates', () => {
    let create: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      create = jest.spyOn(UpdateService, 'create').mockResolvedValue({ id: UPDATE_ID } as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/updates')
          .send({ project_id: PROJECT_ID, ...VALID_BODY })
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not create the update', () => {
        expect(create).not.toHaveBeenCalled()
      })
    })

    // Posting an update to somebody else's project is the thing this route must refuse.
    describe('when the caller is neither author nor coauthor', () => {
      beforeEach(async () => {
        isAuthorOrCoauthor.mockResolvedValue(false)
        response = await supertest(app)
          .post('/api/updates')
          .set('x-test-auth', STRANGER)
          .send({ project_id: PROJECT_ID, ...VALID_BODY })
      })

      it('should respond with a 401 rather than a server error', () => {
        expect(response.status).toBe(401)
      })

      it('should not create the update', () => {
        expect(create).not.toHaveBeenCalled()
      })
    })

    describe('when the author posts an update', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/updates')
          .set('x-test-auth', AUTHOR)
          .send({ project_id: PROJECT_ID, ...VALID_BODY })
      })

      it('should check ownership against the authenticated address', () => {
        expect(isAuthorOrCoauthor).toHaveBeenCalledWith(AUTHOR, PROJECT_ID)
      })

      it('should create the update', () => {
        expect(create).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the body claims a different author', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/updates')
          .set('x-test-auth', COAUTHOR)
          .send({ project_id: PROJECT_ID, ...VALID_BODY, author: AUTHOR })
      })

      it('should store the authenticated caller instead', () => {
        expect(create).toHaveBeenCalledWith(expect.objectContaining({ author: COAUTHOR }), expect.anything(), COAUTHOR)
      })
    })
  })

  describe('PATCH /api/updates/:update_id', () => {
    let updateProjectUpdate: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      updateProjectUpdate = jest.spyOn(UpdateService, 'updateProjectUpdate').mockResolvedValue({} as never)
      jest
        .spyOn(UpdateService, 'getById')
        .mockResolvedValue({ id: UPDATE_ID, project_id: PROJECT_ID, completion_date: new Date() } as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).patch(`/api/updates/${UPDATE_ID}`).send(VALID_PATCH_BODY)
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not edit the update', () => {
        expect(updateProjectUpdate).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is neither author nor coauthor', () => {
      beforeEach(async () => {
        isAuthorOrCoauthor.mockResolvedValue(false)
        response = await supertest(app)
          .patch(`/api/updates/${UPDATE_ID}`)
          .set('x-test-auth', STRANGER)
          .send(VALID_PATCH_BODY)
      })

      it('should refuse the request', () => {
        expect(response.status).toBe(401)
      })

      it('should not edit the update', () => {
        expect(updateProjectUpdate).not.toHaveBeenCalled()
      })
    })

    // The body is validated before the update is looked up, so this case needs a valid one to
    // reach the not-found path at all.
    describe('when the update does not exist', () => {
      beforeEach(async () => {
        ;(UpdateService.getById as jest.Mock).mockResolvedValue(undefined)
        response = await supertest(app)
          .patch(`/api/updates/${UPDATE_ID}`)
          .set('x-test-auth', AUTHOR)
          .send(VALID_PATCH_BODY)
      })

      it('should respond with a 404', () => {
        expect(response.status).toBe(404)
      })

      it('should not check ownership against a project it never found', () => {
        expect(isAuthorOrCoauthor).not.toHaveBeenCalled()
      })
    })

    describe('when the author edits their update', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .patch(`/api/updates/${UPDATE_ID}`)
          .set('x-test-auth', AUTHOR)
          .send(VALID_PATCH_BODY)
      })

      it('should check ownership against the authenticated address', () => {
        expect(isAuthorOrCoauthor).toHaveBeenCalledWith(AUTHOR, PROJECT_ID)
      })

      it('should apply the edit', () => {
        expect(updateProjectUpdate).toHaveBeenCalledTimes(1)
      })
    })

    describe('when a coauthor edits an update someone else wrote', () => {
      beforeEach(async () => {
        ;(UpdateService.getById as jest.Mock).mockResolvedValue({
          id: UPDATE_ID,
          project_id: PROJECT_ID,
          author: AUTHOR,
          completion_date: new Date(),
        })
        response = await supertest(app)
          .patch(`/api/updates/${UPDATE_ID}`)
          .set('x-test-auth', COAUTHOR)
          .send({ ...VALID_PATCH_BODY, author: STRANGER })
      })

      it('should allow the edit', () => {
        expect(response.status).toBe(201)
      })

      it('should keep the stored author rather than the one in the body', () => {
        expect(updateProjectUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({ author: AUTHOR }),
          COAUTHOR
        )
      })
    })

    describe('when a coauthor completes a pending update that has no author yet', () => {
      beforeEach(async () => {
        ;(UpdateService.getById as jest.Mock).mockResolvedValue({
          id: UPDATE_ID,
          project_id: PROJECT_ID,
          author: null,
          completion_date: null,
        })
        await supertest(app)
          .patch(`/api/updates/${UPDATE_ID}`)
          .set('x-test-auth', COAUTHOR)
          .send({ ...VALID_PATCH_BODY, author: AUTHOR })
      })

      it('should record the caller as the author', () => {
        expect(updateProjectUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({ author: COAUTHOR }),
          COAUTHOR
        )
      })
    })
  })

  describe('DELETE /api/updates/:update_id', () => {
    let remove: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      remove = jest.spyOn(UpdateService, 'delete').mockResolvedValue(undefined as never)
      jest.spyOn(UpdateService, 'commentUpdateDeleteInDiscourse').mockImplementation(() => undefined)
      jest
        .spyOn(UpdateService, 'getById')
        .mockResolvedValue({ id: UPDATE_ID, project_id: PROJECT_ID, completion_date: new Date() } as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).delete(`/api/updates/${UPDATE_ID}`)
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not delete the update', () => {
        expect(remove).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is neither author nor coauthor', () => {
      beforeEach(async () => {
        isAuthorOrCoauthor.mockResolvedValue(false)
        response = await supertest(app).delete(`/api/updates/${UPDATE_ID}`).set('x-test-auth', STRANGER)
      })

      it('should refuse the request', () => {
        expect(response.status).toBe(401)
      })

      it('should not delete the update', () => {
        expect(remove).not.toHaveBeenCalled()
      })
    })

    describe('when the update was never completed', () => {
      beforeEach(async () => {
        ;(UpdateService.getById as jest.Mock).mockResolvedValue({
          id: UPDATE_ID,
          project_id: PROJECT_ID,
          completion_date: null,
        })
        response = await supertest(app).delete(`/api/updates/${UPDATE_ID}`).set('x-test-auth', AUTHOR)
      })

      it('should refuse to delete a pending slot', () => {
        expect(response.status).toBe(400)
      })

      it('should not delete the update', () => {
        expect(remove).not.toHaveBeenCalled()
      })
    })

    describe('when the update does not exist', () => {
      beforeEach(async () => {
        ;(UpdateService.getById as jest.Mock).mockResolvedValue(undefined)
        response = await supertest(app).delete(`/api/updates/${UPDATE_ID}`).set('x-test-auth', AUTHOR)
      })

      it('should respond with a 404', () => {
        expect(response.status).toBe(404)
      })
    })

    describe('when the author deletes a completed update', () => {
      beforeEach(async () => {
        response = await supertest(app).delete(`/api/updates/${UPDATE_ID}`).set('x-test-auth', AUTHOR)
      })

      it('should check ownership against the authenticated address', () => {
        expect(isAuthorOrCoauthor).toHaveBeenCalledWith(AUTHOR, PROJECT_ID)
      })

      it('should delete it', () => {
        expect(remove).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('GET /api/updates/:update_id', () => {
    let response: supertest.Response

    describe('when the update does not exist', () => {
      beforeEach(async () => {
        jest.spyOn(UpdateService, 'getById').mockResolvedValue(undefined as never)
        response = await supertest(app).get(`/api/updates/${UPDATE_ID}`)
      })

      it('should respond with a 404', () => {
        expect(response.status).toBe(404)
      })
    })

    describe('when the update exists', () => {
      beforeEach(async () => {
        jest.spyOn(UpdateService, 'getById').mockResolvedValue({ id: UPDATE_ID, project_id: PROJECT_ID } as never)
        response = await supertest(app).get(`/api/updates/${UPDATE_ID}`)
      })

      it('should return it without requiring authentication', () => {
        expect(response.status).toBe(200)
      })
    })
  })

  describe('the ownership helper the write routes rely on', () => {
    describe('when the project id is not a uuid', () => {
      let outcome: unknown

      beforeEach(async () => {
        outcome = await validations.validateIsAuthorOrCoauthor(AUTHOR, 'not-a-uuid').catch((error) => error)
      })

      it('should refuse before asking who owns it', () => {
        expect(outcome).toBeInstanceOf(Error)
      })
    })

    describe('when the caller is not an address', () => {
      let outcome: unknown

      beforeEach(async () => {
        outcome = await validations.validateIsAuthorOrCoauthor('not-an-address', PROJECT_ID).catch((error) => error)
      })

      it('should refuse before asking who owns it', () => {
        expect(outcome).toBeInstanceOf(Error)
      })
    })

    describe('when the caller does not own the project', () => {
      let outcome: unknown

      beforeEach(async () => {
        isAuthorOrCoauthor.mockResolvedValue(false)
        outcome = await validations.validateIsAuthorOrCoauthor(STRANGER, PROJECT_ID).catch((error) => error)
      })

      it('should raise an unauthorized error', () => {
        expect(outcome).toBeInstanceOf(Error)
      })
    })

    describe('when the caller owns the project', () => {
      let outcome: unknown

      beforeEach(async () => {
        outcome = await validations.validateIsAuthorOrCoauthor(AUTHOR, PROJECT_ID).catch((error) => error)
      })

      it('should resolve', () => {
        expect(outcome).toBeUndefined()
      })
    })
  })
})
