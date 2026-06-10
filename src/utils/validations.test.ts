import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { EventType } from '../shared/types/events'

import { validateEventFilters, validateId, validateStatusUpdate } from './validations'

describe('validateProposalId', () => {
  const UUID = '00000000-0000-0000-0000-000000000000'

  it('should not throw an error for a valid proposal id', () => {
    expect(() => validateId(UUID)).not.toThrow()
  })

  it('should throw an error for a missing required proposal id', () => {
    expect(() => validateId(undefined)).toThrow(RequestError)
  })

  it('should throw an error for an empty required proposal id', () => {
    expect(() => validateId('')).toThrow(RequestError)
  })

  it('should throw an error for proposal id with spaces', () => {
    expect(() => validateId('    ')).toThrow(RequestError)
  })
})

describe('validateEventTypesFilters', () => {
  test('Should return an empty object when event_type is not provided', () => {
    const req = { query: {} } as never
    const result = validateEventFilters(req)
    expect(result).toEqual({})
  })

  test('Should convert event_type into an array when it is a string', () => {
    const req = { query: { event_type: EventType.Voted } } as never
    const result = validateEventFilters(req)
    expect(result).toEqual({ event_type: [EventType.Voted] })
  })

  test('Should keep event_type as an array when it is already an array', () => {
    const req = { query: { event_type: [EventType.Voted, EventType.ProjectUpdateCommented] } } as never
    const result = validateEventFilters(req)
    expect(result).toEqual({ event_type: [EventType.Voted, EventType.ProjectUpdateCommented] })
  })

  test('Should throw an error if EventFilterSchema returns an error', () => {
    const req = { query: { event_type: 'single_event' } } as never

    expect(() => validateEventFilters(req)).toThrow()
  })
})

describe('validateStatusUpdate', () => {
  it('allows reverting an enacted draft proposal back to passed', () => {
    const proposal = createTestProposal(ProposalType.Draft, ProposalStatus.Enacted)

    expect(() => validateStatusUpdate(proposal, { status: ProposalStatus.Passed })).not.toThrow()
  })

  it('does not allow poll proposals to be enacted', () => {
    const proposal = createTestProposal(ProposalType.Poll, ProposalStatus.Passed)

    expect(() => validateStatusUpdate(proposal, { status: ProposalStatus.Enacted })).toThrow(RequestError)
  })

  it('does not allow draft proposals to be enacted', () => {
    const proposal = createTestProposal(ProposalType.Draft, ProposalStatus.Passed)

    expect(() => validateStatusUpdate(proposal, { status: ProposalStatus.Enacted })).toThrow(RequestError)
  })

  it('allows governance proposals to be enacted', () => {
    const proposal = createTestProposal(ProposalType.Governance, ProposalStatus.Passed)

    expect(() => validateStatusUpdate(proposal, { status: ProposalStatus.Enacted })).not.toThrow()
  })
})

describe('validateEventTypesFilters', () => {
  test('Should return an empty object when event_type is not provided', () => {
    const req = { query: {} } as never
    const result = validateEventFilters(req)
    expect(result).toEqual({})
  })

  test('Should convert event_type into an array when it is a string', () => {
    const req = { query: { event_type: EventType.Voted } } as never
    const result = validateEventFilters(req)
    expect(result).toEqual({ event_type: [EventType.Voted] })
  })

  test('Should keep event_type as an array when it is already an array', () => {
    const req = { query: { event_type: [EventType.Voted, EventType.ProjectUpdateCommented] } } as never
    const result = validateEventFilters(req)
    expect(result).toEqual({ event_type: [EventType.Voted, EventType.ProjectUpdateCommented] })
  })

  test('Should throw an error if EventFilterSchema returns an error', () => {
    const req = { query: { event_type: 'single_event' } } as never

    expect(() => validateEventFilters(req)).toThrow()
  })
})
