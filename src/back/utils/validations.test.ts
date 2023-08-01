import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { validateProposalId } from './validations'

describe('validateProposalId', () => {
  const UUID = '00000000-0000-0000-0000-000000000000'

  describe('when id is optional', () => {
    it('should not throw an error when not provided', () => {
      expect(() => validateProposalId(undefined, 'optional')).not.toThrow()
    })

    it('should not throw an error when it is an empty string', () => {
      expect(() => validateProposalId('', 'optional')).not.toThrow(RequestError)
    })

    it('should throw an error for proposal id with spaces', () => {
      expect(() => validateProposalId('    ', 'optional')).toThrow(RequestError)
    })

    it('should not throw an error for a valid proposal id', () => {
      expect(() => validateProposalId(UUID, 'optional')).not.toThrow()
    })
  })

  describe('when it is required', () => {
    it('should not throw an error for a valid proposal id', () => {
      expect(() => validateProposalId(UUID)).not.toThrow()
    })

    it('should throw an error for a missing required proposal id', () => {
      expect(() => validateProposalId(undefined)).toThrow(RequestError)
    })

    it('should throw an error for an empty required proposal id', () => {
      expect(() => validateProposalId('')).toThrow(RequestError)
    })

    it('should throw an error for proposal id with spaces', () => {
      expect(() => validateProposalId('    ', 'optional')).toThrow(RequestError)
    })
  })
})
