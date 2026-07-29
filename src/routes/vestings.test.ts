import { Server } from 'http'
import supertest from 'supertest'

import { VestingService } from '../services/VestingService'

import { createTestApp } from './testApp'
import vestings from './vestings'

const ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const OTHER_ADDRESS = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'

describe('the vesting routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(vestings)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // These forward straight to the vesting subgraph, so an unvalidated address becomes an outbound
  // query built from whatever the caller sent.
  describe('POST /api/vesting', () => {
    let getVestings: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getVestings = jest.spyOn(VestingService, 'getVestings').mockResolvedValue([] as never)
    })

    describe('when every address is an ethereum address', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/vesting')
          .send({ addresses: [ADDRESS, OTHER_ADDRESS] })
      })

      it('should forward them', () => {
        expect(getVestings).toHaveBeenCalledWith([ADDRESS, OTHER_ADDRESS])
      })
    })

    describe('when one address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/vesting')
          .send({ addresses: [ADDRESS, 'not-an-address'] })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not query for the valid ones either', () => {
        expect(getVestings).not.toHaveBeenCalled()
      })
    })
  })

  describe('GET /api/vesting/:address', () => {
    let getVestingWithLogs: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getVestingWithLogs = jest.spyOn(VestingService, 'getVestingWithLogs').mockResolvedValue({} as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/vesting/not-an-address')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not query for it', () => {
        expect(getVestingWithLogs).not.toHaveBeenCalled()
      })
    })

    describe('when the address is valid', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/vesting/${ADDRESS}`)
      })

      it('should query for it without requiring authentication', () => {
        expect(getVestingWithLogs).toHaveBeenCalledWith(ADDRESS)
      })
    })
  })

  describe('GET /api/all-vestings', () => {
    let getAllVestings: jest.SpyInstance

    beforeEach(() => {
      getAllVestings = jest.spyOn(VestingService, 'getAllVestings').mockResolvedValue([] as never)
    })

    describe('when it is requested', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/all-vestings')
      })

      it('should be served without requiring authentication', () => {
        expect(getAllVestings).toHaveBeenCalled()
      })
    })
  })
})
