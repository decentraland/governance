import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { EventType } from '../shared/types/events'

import {
  extractImageUrls,
  isValidImage,
  validateBlockNumber,
  validateEventFilters,
  validateId,
  validateStatusUpdate,
} from './validations'

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

describe('extractImageUrls', () => {
  describe('when the markdown contains an inline image', () => {
    it('should extract the url', () => {
      expect(extractImageUrls('text ![alt](https://cdn.decentraland.org/a.png) more')).toEqual([
        'https://cdn.decentraland.org/a.png',
      ])
    })
  })

  describe('when the inline image has a title after the url', () => {
    it('should extract only the url and drop the title', () => {
      expect(extractImageUrls('![alt](https://cdn.decentraland.org/a.png "a title")')).toEqual([
        'https://cdn.decentraland.org/a.png',
      ])
    })
  })

  describe('when the markdown uses a reference-style image definition', () => {
    it('should extract the referenced url', () => {
      expect(extractImageUrls('[ref]: https://cdn.decentraland.org/a.png')).toEqual([
        'https://cdn.decentraland.org/a.png',
      ])
    })
  })

  describe('when the markdown embeds a raw HTML img tag', () => {
    it('should extract the src of a double-quoted img tag', () => {
      expect(extractImageUrls('<img src="https://evil.example/track.png">')).toEqual(['https://evil.example/track.png'])
    })

    it('should extract the src of a single-quoted img tag that has other attributes first', () => {
      expect(extractImageUrls("<img class='x' src='https://evil.example/track.png' />")).toEqual([
        'https://evil.example/track.png',
      ])
    })

    it('should extract the src of an unquoted img tag', () => {
      expect(extractImageUrls('<img src=https://evil.example/track.png width=10>')).toEqual([
        'https://evil.example/track.png',
      ])
    })
  })

  describe('when the markdown contains no images', () => {
    it('should return an empty array', () => {
      expect(extractImageUrls('just some text with a [link](https://decentraland.org)')).toEqual([])
    })
  })
})

describe('isValidImage', () => {
  describe('when the url is not on a trusted domain', () => {
    it('should return false without performing a request', async () => {
      await expect(isValidImage('https://evil.example/track.png')).resolves.toBe(false)
    })
  })
})

describe('validateBlockNumber', () => {
  describe('when the block number is a finite number', () => {
    it('should not throw', () => {
      expect(() => validateBlockNumber(12345)).not.toThrow()
    })
  })

  describe('when the block number is null or undefined', () => {
    it('should not throw for null', () => {
      expect(() => validateBlockNumber(null)).not.toThrow()
    })

    it('should not throw for undefined', () => {
      expect(() => validateBlockNumber(undefined)).not.toThrow()
    })
  })

  describe('when the block number is NaN', () => {
    it('should throw an invalid block number error', () => {
      expect(() => validateBlockNumber(NaN)).toThrow('Invalid blockNumber')
    })
  })

  describe('when the block number is a string', () => {
    it('should throw an invalid block number error', () => {
      expect(() => validateBlockNumber('12345')).toThrow('Invalid blockNumber')
    })
  })
})
