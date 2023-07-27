import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { validateProposalId } from './validations'

describe('validateProposalId', () => {
  describe('when id is optional', () => {
    it('should not throw an error when not provided', () => {
      expect(() => validateProposalId(undefined, 'optional')).not.toThrow()
    })

    it('should not throw an error when it is an empty string', () => {
      expect(() => validateProposalId('', 'optional')).toThrow(RequestError)
    })

    it('should throw an error for proposal id with spaces', () => {
      expect(() => validateProposalId('    ', 'optional')).toThrow(RequestError)
    })

    it('should not throw an error for a valid proposal id', () => {
      expect(() => validateProposalId('any string is fine really', 'optional')).not.toThrow()
    })
  })

  describe('when it is required', () => {
    it('should not throw an error for a valid proposal id', () => {
      expect(() => validateProposalId('any string is fine really')).not.toThrow()
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
