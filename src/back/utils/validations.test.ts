import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { EventType } from '../../shared/types/events'

import { validateEventTypesFilters, validateProposalId } from './validations'

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

describe('validateEventTypesFilters', () => {
  test('Should return an empty object when event_type is not provided', () => {
    const req = { query: {} } as never
    const result = validateEventTypesFilters(req)
    expect(result).toEqual({})
  })

  test('Should convert event_type into an array when it is a string', () => {
    const req = { query: { event_type: EventType.Voted } } as never
    const result = validateEventTypesFilters(req)
    expect(result).toEqual({ event_type: [EventType.Voted] })
  })

  test('Should keep event_type as an array when it is already an array', () => {
    const req = { query: { event_type: [EventType.Voted, EventType.ProjectUpdateCommented] } } as never
    const result = validateEventTypesFilters(req)
    expect(result).toEqual({ event_type: [EventType.Voted, EventType.ProjectUpdateCommented] })
  })

  test('Should throw an error if EventFilterSchema returns an error', () => {
    const req = { query: { event_type: 'single_event' } } as never

    expect(() => validateEventTypesFilters(req)).toThrow()
  })
})
