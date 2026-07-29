import { Server } from 'http'
import supertest from 'supertest'

import { SnapshotService } from '../services/SnapshotService'
import { MAX_ADDRESSES_PER_REQUEST, MAX_PENDING_PROPOSALS_LIMIT } from '../utils/validations'

import snapshot from './snapshot'
import { createTestApp } from './testApp'

const VALID_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const START = '2024-01-01T00:00:00.000Z'
const END = '2024-02-01T00:00:00.000Z'

describe('the snapshot proxy routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(snapshot)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // These endpoints are unauthenticated and forward their input to Snapshot, so the caps are the
  // only thing standing between a caller and an arbitrarily large outbound request.
  describe('POST /api/snapshot/votes', () => {
    let getVotesByAddresses: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getVotesByAddresses = jest.spyOn(SnapshotService, 'getVotesByAddresses').mockResolvedValue([] as never)
    })

    describe('when the address list is within the cap', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/votes')
          .send({ addresses: [VALID_ADDRESS] })
      })

      it('should forward the request', () => {
        expect(getVotesByAddresses).toHaveBeenCalledWith([VALID_ADDRESS])
      })

      it('should respond successfully', () => {
        expect(response.status).toBe(201)
      })
    })

    // A list long enough to exceed MAX_ADDRESSES_PER_REQUEST is also far past body-parser's 100kb
    // default, which withBody() does not raise, so express rejects it before the cap is consulted.
    // The cap itself is covered directly in validations.test.ts; over HTTP the body limit is what
    // actually bounds this endpoint.
    describe('when the address list is large enough to exceed the cap', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/votes')
          .send({ addresses: new Array(MAX_ADDRESSES_PER_REQUEST + 1).fill(VALID_ADDRESS) })
      })

      it('should be rejected by the body size limit before the handler runs', () => {
        expect(response.status).toBe(413)
      })

      it('should not reach snapshot', () => {
        expect(getVotesByAddresses).not.toHaveBeenCalled()
      })
    })

    describe('when the address list holds a non-address entry', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/votes')
          .send({ addresses: [VALID_ADDRESS, 'not-an-address'] })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not reach snapshot', () => {
        expect(getVotesByAddresses).not.toHaveBeenCalled()
      })
    })

    describe('when addresses is not an array', () => {
      beforeEach(async () => {
        response = await supertest(app).post('/api/snapshot/votes').send({ addresses: 'nope' })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })
    })
  })

  describe('POST /api/snapshot/proposals/pending', () => {
    let getPendingProposals: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getPendingProposals = jest.spyOn(SnapshotService, 'getPendingProposals').mockResolvedValue([] as never)
    })

    describe('when the limit is within the cap', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/proposals/pending')
          .send({ start: START, end: END, fields: ['id'], limit: 5 })
      })

      it('should forward the limit unchanged', () => {
        expect(getPendingProposals).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), ['id'], 5)
      })

      it('should respond successfully', () => {
        expect(response.status).toBe(201)
      })
    })

    describe('when the limit is omitted', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/snapshot/proposals/pending')
          .send({ start: START, end: END, fields: ['id'] })
      })

      it('should forward undefined so the client default applies', () => {
        expect(getPendingProposals).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), ['id'], undefined)
      })
    })

    describe('when the limit exceeds the cap', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/proposals/pending')
          .send({ start: START, end: END, fields: ['id'], limit: MAX_PENDING_PROPOSALS_LIMIT + 1 })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not ask snapshot for an unbounded page', () => {
        expect(getPendingProposals).not.toHaveBeenCalled()
      })
    })

    describe('when the limit is a numeric string', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/proposals/pending')
          .send({ start: START, end: END, fields: ['id'], limit: '10' })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })
    })

    describe('when the requested fields are not snapshot proposal fields', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/proposals/pending')
          .send({ start: START, end: END, fields: ['id { __schema }'] })
      })

      it('should respond with a 400 rather than interpolate them into the query', () => {
        expect(response.status).toBe(400)
      })

      it('should not reach snapshot', () => {
        expect(getPendingProposals).not.toHaveBeenCalled()
      })
    })

    describe('when the dates are invalid', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/proposals/pending')
          .send({ start: 'nope', end: END, fields: ['id'] })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })
    })
  })

  describe('POST /api/snapshot/scores', () => {
    let getScores: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getScores = jest.spyOn(SnapshotService, 'getScores').mockResolvedValue({} as never)
    })

    describe('when the address list is empty', () => {
      beforeEach(async () => {
        response = await supertest(app).post('/api/snapshot/scores').send({ addresses: [] })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not reach snapshot', () => {
        expect(getScores).not.toHaveBeenCalled()
      })
    })

    describe('when the address list is large enough to exceed the cap', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/snapshot/scores')
          .send({ addresses: new Array(MAX_ADDRESSES_PER_REQUEST + 1).fill(VALID_ADDRESS) })
      })

      it('should be rejected by the body size limit before the handler runs', () => {
        expect(response.status).toBe(413)
      })
    })
  })

  describe('GET /api/snapshot/vp-distribution/:address', () => {
    let getVpDistribution: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getVpDistribution = jest.spyOn(SnapshotService, 'getVpDistribution').mockResolvedValue({} as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/snapshot/vp-distribution/not-an-address')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not reach snapshot', () => {
        expect(getVpDistribution).not.toHaveBeenCalled()
      })
    })

    describe('when the address is valid', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/snapshot/vp-distribution/${VALID_ADDRESS}`)
      })

      it('should forward the request', () => {
        expect(getVpDistribution).toHaveBeenCalledWith(VALID_ADDRESS, undefined)
      })
    })
  })
})
