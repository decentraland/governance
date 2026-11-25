import { Server } from 'http'
import supertest from 'supertest'

import badges from './badges'
import { createTestApp } from './testApp'

const ADDRESS = '0x49E4DbfF86a2E5DA27c540c9A9E8D2C3726E278F'

// Badges are retired. The two public reads answer an empty, well-formed result so a frontend built
// before the retirement keeps rendering "no badges"; every badge write is gone.
describe('the retired badge routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(badges)
  })

  describe('GET /api/badges/:address', () => {
    describe('when the address is valid', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app).get(`/api/badges/${ADDRESS}/`)
      })

      it('should answer with no badges in the shape the old frontend reads', () => {
        expect(response.body).toEqual({ ok: true, data: { currentBadges: [], expiredBadges: [], total: 0 } })
      })
    })

    describe('when the address is not an ethereum address', () => {
      it('should respond with a 400, as before', async () => {
        const response = await supertest(app).get('/api/badges/not-an-address/')
        expect(response.status).toBe(400)
      })
    })
  })

  describe('GET /api/badges/core-units', () => {
    it('should answer with an empty list', async () => {
      const response = await supertest(app).get('/api/badges/core-units/')
      expect(response.body).toEqual({ ok: true, data: [] })
    })
  })

  describe.each(['airdrop', 'revoke', 'upload-badge-spec', 'create-badge-spec'])('POST /api/badges/%s', (action) => {
    it('should no longer be served', async () => {
      const response = await supertest(app).post(`/api/badges/${action}/`).send({})
      expect(response.status).toBe(404)
    })
  })
})
