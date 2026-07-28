import crypto from 'crypto'
import { Express } from 'express'
import supertest from 'supertest'

import { EventsService } from '../services/events'

import { createWebhookTestApp } from './testApp'
import webhooks from './webhooks'

const ALCHEMY_SECRET = 'alchemy-test-secret'
const DISCOURSE_SECRET = 'discourse-test-secret'

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  ALCHEMY_DELEGATIONS_WEBHOOK_SECRET: 'alchemy-test-secret',
  DISCOURSE_WEBHOOK_SECRET: 'discourse-test-secret',
}))

function sign(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function alchemyBody(transactions: unknown[]) {
  return { event: { data: { block: { hash: '0x1', number: 1, timestamp: 1700000000, transactions } } } }
}

describe('POST /api/webhooks/alchemy/delegation', () => {
  let app: Express
  let delegationUpdate: jest.SpyInstance

  beforeEach(() => {
    app = createWebhookTestApp(webhooks)
    delegationUpdate = jest.spyOn(EventsService, 'delegationUpdate').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the signature is missing', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .send(alchemyBody([{ hash: '0xaa' }]))
    })

    it('should respond with a 403 rather than accepting the payload', () => {
      expect(response.status).toBe(403)
    })

    it('should not process the block', () => {
      expect(delegationUpdate).not.toHaveBeenCalled()
    })
  })

  describe('when the signature was produced with the wrong secret', () => {
    let response: supertest.Response

    beforeEach(async () => {
      const body = alchemyBody([{ hash: '0xaa' }])
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .set('x-alchemy-signature', sign('not-the-secret', JSON.stringify(body)))
        .send(body)
    })

    it('should respond with a 403', () => {
      expect(response.status).toBe(403)
    })

    it('should not process the block', () => {
      expect(delegationUpdate).not.toHaveBeenCalled()
    })
  })

  describe('when the signature is valid', () => {
    let response: supertest.Response

    beforeEach(async () => {
      const body = alchemyBody([{ hash: '0xaa' }])
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .set('x-alchemy-signature', sign(ALCHEMY_SECRET, JSON.stringify(body)))
        .send(body)
    })

    it('should respond with a 201, the status handleAPI returns for a successful post', () => {
      expect(response.status).toBe(201)
    })

    it('should hand the block to the events service', () => {
      expect(delegationUpdate).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the block carries no transactions', () => {
    let response: supertest.Response

    beforeEach(async () => {
      const body = alchemyBody([])
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .set('x-alchemy-signature', sign(ALCHEMY_SECRET, JSON.stringify(body)))
        .send(body)
    })

    it('should accept it without processing', () => {
      expect(response.status).toBe(201)
    })

    it('should not call the events service', () => {
      expect(delegationUpdate).not.toHaveBeenCalled()
    })
  })

  describe('when processing the block fails', () => {
    let response: supertest.Response

    beforeEach(async () => {
      delegationUpdate.mockRejectedValue(new Error('processing failed'))
      const body = alchemyBody([{ hash: '0xaa' }])
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .set('x-alchemy-signature', sign(ALCHEMY_SECRET, JSON.stringify(body)))
        .send(body)
    })

    // Alchemy retries on a non-2xx, and delegationUpdate is idempotent, so the failure must not
    // be masked with a 200.
    it('should respond with a non-2xx so delivery is retried', () => {
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})

describe('POST /api/webhooks/discourse/comment', () => {
  let app: Express
  let commented: jest.SpyInstance
  const body = { post: { id: 7 } }

  beforeEach(() => {
    app = createWebhookTestApp(webhooks)
    commented = jest.spyOn(EventsService, 'commented').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the signature is missing', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(app)
        .post('/api/webhooks/discourse/comment')
        .set('X-Discourse-Event-Id', '1')
        .set('X-Discourse-Event', 'post_created')
        .send(body)
    })

    it('should respond with a 403', () => {
      expect(response.status).toBe(403)
    })

    it('should not record the comment', () => {
      expect(commented).not.toHaveBeenCalled()
    })
  })

  describe('when the signature is valid but the event headers are missing', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(app)
        .post('/api/webhooks/discourse/comment')
        .set('X-Discourse-Event-Signature', `sha256=${sign(DISCOURSE_SECRET, JSON.stringify(body))}`)
        .send(body)
    })

    it('should respond with a 400', () => {
      expect(response.status).toBe(400)
    })

    it('should not record the comment', () => {
      expect(commented).not.toHaveBeenCalled()
    })
  })

  describe('when the signature and event headers are valid', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(app)
        .post('/api/webhooks/discourse/comment')
        .set('X-Discourse-Event-Signature', `sha256=${sign(DISCOURSE_SECRET, JSON.stringify(body))}`)
        .set('X-Discourse-Event-Id', '1')
        .set('X-Discourse-Event', 'post_created')
        .send(body)
    })

    it('should respond with a 201', () => {
      expect(response.status).toBe(201)
    })

    it('should record the comment with the event metadata and post', () => {
      expect(commented).toHaveBeenCalledWith('1', 'post_created', body.post)
    })
  })
})
