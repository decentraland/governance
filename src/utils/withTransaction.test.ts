import { Pool } from 'pg'

import { closeTransactionPool, withTransaction } from './withTransaction'

jest.mock('pg', () => ({
  Pool: jest.fn(),
}))

type MockClient = {
  query: jest.Mock
  release: jest.Mock
}

describe('withTransaction', () => {
  let client: MockClient

  beforeEach(() => {
    client = { query: jest.fn().mockResolvedValue({ rows: [] }), release: jest.fn() }
    ;(Pool as unknown as jest.Mock).mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(client),
      end: jest.fn().mockResolvedValue(undefined),
    }))
  })

  afterEach(async () => {
    await closeTransactionPool()
    jest.resetAllMocks()
  })

  describe('when the callback resolves', () => {
    let result: string

    beforeEach(async () => {
      result = await withTransaction(async () => 'committed')
    })

    it('should commit the transaction', () => {
      expect(client.query).toHaveBeenCalledWith('COMMIT')
    })

    it('should return the value the callback resolved with', () => {
      expect(result).toBe('committed')
    })

    it('should return the client to the pool without an error', () => {
      expect(client.release).toHaveBeenCalledWith(undefined)
    })
  })

  describe('when the callback throws', () => {
    let callbackError: Error

    beforeEach(() => {
      callbackError = new Error('callback failed')
    })

    describe('and the rollback succeeds', () => {
      let thrown: unknown

      beforeEach(async () => {
        thrown = await withTransaction(async () => {
          throw callbackError
        }).catch((error) => error)
      })

      it('should roll back the transaction', () => {
        expect(client.query).toHaveBeenCalledWith('ROLLBACK')
      })

      it('should propagate the error thrown by the callback', () => {
        expect(thrown).toBe(callbackError)
      })

      it('should return the client to the pool without an error', () => {
        expect(client.release).toHaveBeenCalledWith(undefined)
      })
    })

    describe('and the rollback fails', () => {
      let rollbackError: Error
      let thrown: unknown

      beforeEach(async () => {
        rollbackError = new Error('rollback failed')
        client.query.mockImplementation((sql: string) =>
          sql === 'ROLLBACK' ? Promise.reject(rollbackError) : Promise.resolve({ rows: [] })
        )
        thrown = await withTransaction(async () => {
          throw callbackError
        }).catch((error) => error)
      })

      it('should propagate the original callback error rather than the rollback failure', () => {
        expect(thrown).toBe(callbackError)
      })

      it('should destroy the connection by releasing it with the rollback error', () => {
        expect(client.release).toHaveBeenCalledWith(rollbackError)
      })
    })
  })

  describe('when the commit fails', () => {
    let commitError: Error
    let thrown: unknown

    beforeEach(async () => {
      commitError = new Error('commit failed')
      client.query.mockImplementation((sql: string) =>
        sql === 'COMMIT' ? Promise.reject(commitError) : Promise.resolve({ rows: [] })
      )
      thrown = await withTransaction(async () => 'committed').catch((error) => error)
    })

    it('should propagate the commit error', () => {
      expect(thrown).toBe(commitError)
    })

    it('should destroy the connection by releasing it with the commit error', () => {
      expect(client.release).toHaveBeenCalledWith(commitError)
    })

    it('should not attempt a rollback on the already aborted transaction', () => {
      expect(client.query).not.toHaveBeenCalledWith('ROLLBACK')
    })
  })
})
