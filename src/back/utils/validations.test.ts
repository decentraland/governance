import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { validateProposalId } from './validations'

describe('validateProposalId', () => {
  const UUID = '00000000-0000-0000-0000-000000000000'

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
    expect(() => validateProposalId('    ')).toThrow(RequestError)
  })
})
