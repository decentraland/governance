import crypto from 'crypto'
import { Server } from 'http'
import supertest from 'supertest'

import { ErrorService } from '../services/ErrorService'
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
  let app: Server
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

  // The route captures the exact bytes before parsing and falls back to re-serialising the parsed
  // body when it cannot. These payloads are deliberately not what JSON.stringify would produce —
  // the spacing and key order differ — so they only verify if the captured bytes are used. Signing
  // JSON.stringify(body) and sending that same object cannot tell the two paths apart.
  describe('when the signed bytes differ from what re-serialising the body would produce', () => {
    const rawBody =
      '{ "event" : { "data" : { "block" : { "transactions" : [ { "hash" : "0xaa" } ] , "number" : 1 } } } }'

    describe('and the signature covers the bytes actually sent', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/webhooks/alchemy/delegation')
          .set('Content-Type', 'application/json')
          .set('x-alchemy-signature', sign(ALCHEMY_SECRET, rawBody))
          .send(rawBody)
      })

      it('should accept it', () => {
        expect(response.status).toBe(201)
      })

      it('should process the block it parsed out of those bytes', () => {
        expect(delegationUpdate).toHaveBeenCalledTimes(1)
      })
    })

    describe('and the signature covers the re-serialised form instead', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/webhooks/alchemy/delegation')
          .set('Content-Type', 'application/json')
          .set('x-alchemy-signature', sign(ALCHEMY_SECRET, JSON.stringify(JSON.parse(rawBody))))
          .send(rawBody)
      })

      it('should respond with a 403', () => {
        expect(response.status).toBe(403)
      })

      it('should not process the block', () => {
        expect(delegationUpdate).not.toHaveBeenCalled()
      })
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

  // The signature only proves the sender, not the shape. A malformed body that will never become
  // readable must not be retried forever.
  describe('when the signed payload has no block', () => {
    let response: supertest.Response
    let report: jest.SpyInstance

    beforeEach(async () => {
      report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
      const body = { event: {} }
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .set('x-alchemy-signature', sign(ALCHEMY_SECRET, JSON.stringify(body)))
        .send(body)
    })

    it('should accept it instead of failing in a way alchemy would retry', () => {
      expect(response.status).toBe(201)
    })

    it('should not try to process it', () => {
      expect(delegationUpdate).not.toHaveBeenCalled()
    })

    it('should report the unexpected payload', () => {
      expect(report).toHaveBeenCalledWith('Unexpected alchemy delegation webhook payload', expect.anything())
    })
  })

  describe('when the signed payload carries no transaction list', () => {
    let response: supertest.Response

    beforeEach(async () => {
      jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
      const body = { event: { data: { block: { hash: '0x1' } } } }
      response = await supertest(app)
        .post('/api/webhooks/alchemy/delegation')
        .set('x-alchemy-signature', sign(ALCHEMY_SECRET, JSON.stringify(body)))
        .send(body)
    })

    it('should accept it rather than throwing on the missing field', () => {
      expect(response.status).toBe(201)
    })

    it('should not try to process it', () => {
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
      expect(response.status).toBe(500)
    })
  })
})

describe('POST /api/webhooks/discourse/comment', () => {
  let app: Server
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

  // Same reasoning as the alchemy endpoint: signing what JSON.stringify produces and sending that
  // same object cannot distinguish the captured bytes from the re-serialised fallback.
  describe('when the signed bytes differ from what re-serialising the body would produce', () => {
    const rawBody = '{ "post" : { "id" : 7 , "topic_id" : 42 } }'

    describe('and the signature covers the bytes actually sent', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/webhooks/discourse/comment')
          .set('Content-Type', 'application/json')
          .set('X-Discourse-Event-Signature', `sha256=${sign(DISCOURSE_SECRET, rawBody)}`)
          .set('X-Discourse-Event-Id', '1')
          .set('X-Discourse-Event', 'post_created')
          .send(rawBody)
      })

      it('should accept it', () => {
        expect(response.status).toBe(201)
      })

      it('should record the comment parsed out of those bytes', () => {
        expect(commented).toHaveBeenCalledWith('1', 'post_created', { id: 7, topic_id: 42 })
      })
    })

    describe('and the signature covers the re-serialised form instead', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/webhooks/discourse/comment')
          .set('Content-Type', 'application/json')
          .set('X-Discourse-Event-Signature', `sha256=${sign(DISCOURSE_SECRET, JSON.stringify(JSON.parse(rawBody)))}`)
          .set('X-Discourse-Event-Id', '1')
          .set('X-Discourse-Event', 'post_created')
          .send(rawBody)
      })

      it('should respond with a 403', () => {
        expect(response.status).toBe(403)
      })

      it('should not record the comment', () => {
        expect(commented).not.toHaveBeenCalled()
      })
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
