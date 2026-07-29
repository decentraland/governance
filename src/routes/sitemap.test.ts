import { Server } from 'http'
import supertest from 'supertest'

import ProposalModel from '../entities/Proposal/model'

import sitemap from './sitemap'
import { createTestApp } from './testApp'

describe('the sitemap routes', () => {
  let app: Server
  let countAll: jest.SpyInstance
  let getSitemapProposals: jest.SpyInstance
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(sitemap)
    countAll = jest.spyOn(ProposalModel, 'countAll').mockResolvedValue(201)
    getSitemapProposals = jest.spyOn(ProposalModel, 'getSitemapProposals').mockResolvedValue([])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/governance/sitemap.proposals.xml', () => {
    describe('when the requested page exists', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/governance/sitemap.proposals.xml?page=2')
      })

      it('should respond with the sitemap', () => {
        expect(response.status).toBe(200)
      })

      it('should query the requested page', () => {
        expect(getSitemapProposals).toHaveBeenCalledWith(2)
      })
    })

    describe('when the page is negative', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/governance/sitemap.proposals.xml?page=-1')
      })

      it('should respond with an empty sitemap', () => {
        expect(response.text).toContain('<urlset')
      })

      it('should not count proposals', () => {
        expect(countAll).not.toHaveBeenCalled()
      })

      it('should not issue an offset query', () => {
        expect(getSitemapProposals).not.toHaveBeenCalled()
      })
    })

    describe('when the page exceeds the available page count', () => {
      beforeEach(async () => {
        countAll.mockResolvedValue(100)
        response = await supertest(app).get('/api/governance/sitemap.proposals.xml?page=1')
      })

      it('should respond with an empty sitemap', () => {
        expect(response.text).toContain('<urlset')
      })

      it('should not issue an offset query', () => {
        expect(getSitemapProposals).not.toHaveBeenCalled()
      })
    })

    describe('when the page is not a safe integer', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/governance/sitemap.proposals.xml?page=999999999999999999999999999999')
      })

      it('should not count proposals', () => {
        expect(countAll).not.toHaveBeenCalled()
      })

      it('should not issue an offset query', () => {
        expect(getSitemapProposals).not.toHaveBeenCalled()
      })
    })
  })
})
