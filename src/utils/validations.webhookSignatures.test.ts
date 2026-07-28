import crypto from 'crypto'
import { Request } from 'express'

import { validateAlchemyWebhookSignature, validateDiscourseWebhookSignature } from './validations'

const DISCOURSE_SECRET = 'discourse-test-secret'
const ALCHEMY_SECRET = 'alchemy-test-secret'

// Both secrets are read from the environment once at import, and both validators refuse outright
// when they are unset. Pin them here so the signature comparison itself is reachable; the
// unconfigured case is covered in validations.test.ts, which runs without this mock.
jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCOURSE_WEBHOOK_SECRET: 'discourse-test-secret',
  ALCHEMY_DELEGATIONS_WEBHOOK_SECRET: 'alchemy-test-secret',
}))

function sign(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// Minimal Request stand-in: the validators only read a header and the body/rawBody pair.
function request(options: { headers?: Record<string, string>; body?: unknown; rawBody?: string }): Request {
  const headers = options.headers ?? {}
  return {
    get: (name: string) => headers[name],
    body: options.body,
    rawBody: options.rawBody,
  } as unknown as Request
}

describe('validateDiscourseWebhookSignature', () => {
  const body = { post: { id: 1 } }

  describe('when the signature matches the payload', () => {
    it('should accept the request', () => {
      const payload = JSON.stringify(body)
      const req = request({
        body,
        headers: { 'X-Discourse-Event-Signature': `sha256=${sign(DISCOURSE_SECRET, payload)}` },
      })
      expect(() => validateDiscourseWebhookSignature(req)).not.toThrow()
    })
  })

  describe('when the signature was produced with a different secret', () => {
    it('should reject the request', () => {
      const payload = JSON.stringify(body)
      const req = request({
        body,
        headers: { 'X-Discourse-Event-Signature': `sha256=${sign('wrong-secret', payload)}` },
      })
      expect(() => validateDiscourseWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when the payload was tampered with after signing', () => {
    it('should reject the request', () => {
      const req = request({
        body: { post: { id: 2 } },
        headers: { 'X-Discourse-Event-Signature': `sha256=${sign(DISCOURSE_SECRET, JSON.stringify(body))}` },
      })
      expect(() => validateDiscourseWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when the signature header is missing', () => {
    // timingSafeEqual throws on a length mismatch, so the length guard is what turns this into a
    // rejection rather than a 500.
    it('should reject the request rather than raise a comparison error', () => {
      expect(() => validateDiscourseWebhookSignature(request({ body }))).toThrow('Invalid signature')
    })
  })

  describe('when the signature is shorter than the expected digest', () => {
    it('should reject the request rather than raise a comparison error', () => {
      const req = request({ body, headers: { 'X-Discourse-Event-Signature': 'sha256=abc' } })
      expect(() => validateDiscourseWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when the signature omits the sha256 prefix', () => {
    it('should reject the request', () => {
      const req = request({
        body,
        headers: { 'X-Discourse-Event-Signature': sign(DISCOURSE_SECRET, JSON.stringify(body)) },
      })
      expect(() => validateDiscourseWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when a raw body was captured before parsing', () => {
    // The sender signs exact bytes. Re-serialising the parsed body can reorder keys or drop
    // whitespace, so the raw bytes must win when present.
    it('should verify against the raw bytes rather than the re-serialised body', () => {
      const rawBody = '{"post":{"id":1},"spacing":  "preserved"}'
      const req = request({
        rawBody,
        body: { spacing: 'preserved', post: { id: 1 } },
        headers: { 'X-Discourse-Event-Signature': `sha256=${sign(DISCOURSE_SECRET, rawBody)}` },
      })
      expect(() => validateDiscourseWebhookSignature(req)).not.toThrow()
    })

    it('should reject a signature computed over the re-serialised body instead', () => {
      const rawBody = '{"post":{"id":1},"spacing":  "preserved"}'
      const reSerialised = JSON.stringify({ spacing: 'preserved', post: { id: 1 } })
      const req = request({
        rawBody,
        body: { spacing: 'preserved', post: { id: 1 } },
        headers: { 'X-Discourse-Event-Signature': `sha256=${sign(DISCOURSE_SECRET, reSerialised)}` },
      })
      expect(() => validateDiscourseWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when the raw body is an empty string', () => {
    it('should fall back to the parsed body', () => {
      const payload = JSON.stringify(body)
      const req = request({
        body,
        rawBody: '',
        headers: { 'X-Discourse-Event-Signature': `sha256=${sign(DISCOURSE_SECRET, payload)}` },
      })
      expect(() => validateDiscourseWebhookSignature(req)).not.toThrow()
    })
  })
})

describe('validateAlchemyWebhookSignature', () => {
  const body = { webhookId: 'wh_1', event: {} }

  describe('when the signature matches the payload', () => {
    it('should accept the request', () => {
      const req = request({
        body,
        headers: { 'x-alchemy-signature': sign(ALCHEMY_SECRET, JSON.stringify(body)) },
      })
      expect(() => validateAlchemyWebhookSignature(req)).not.toThrow()
    })
  })

  describe('when the signature was produced with a different secret', () => {
    it('should reject the request', () => {
      const req = request({
        body,
        headers: { 'x-alchemy-signature': sign('wrong-secret', JSON.stringify(body)) },
      })
      expect(() => validateAlchemyWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when the payload was tampered with after signing', () => {
    it('should reject the request', () => {
      const req = request({
        body: { webhookId: 'wh_2', event: {} },
        headers: { 'x-alchemy-signature': sign(ALCHEMY_SECRET, JSON.stringify(body)) },
      })
      expect(() => validateAlchemyWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when the signature header is missing', () => {
    it('should reject the request rather than raise a comparison error', () => {
      expect(() => validateAlchemyWebhookSignature(request({ body }))).toThrow('Invalid signature')
    })
  })

  describe('when the signature is shorter than the expected digest', () => {
    it('should reject the request rather than raise a comparison error', () => {
      const req = request({ body, headers: { 'x-alchemy-signature': 'deadbeef' } })
      expect(() => validateAlchemyWebhookSignature(req)).toThrow('Invalid signature')
    })
  })

  describe('when a raw body was captured before parsing', () => {
    it('should verify against the raw bytes rather than the re-serialised body', () => {
      const rawBody = '{"webhookId":"wh_1",  "event":{}}'
      const req = request({
        rawBody,
        body,
        headers: { 'x-alchemy-signature': sign(ALCHEMY_SECRET, rawBody) },
      })
      expect(() => validateAlchemyWebhookSignature(req)).not.toThrow()
    })
  })
})
