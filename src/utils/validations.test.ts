import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Request } from 'express'

import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { EventType } from '../shared/types/events'

import {
  MAX_ADDRESSES_PER_REQUEST,
  MAX_PENDING_PROPOSALS_LIMIT,
  extractImageUrls,
  isValidDate,
  isValidImage,
  stringToBoolean,
  validateAddress,
  validateAddresses,
  validateAlchemyWebhookSignature,
  validateBlockNumber,
  validateBoundedAddresses,
  validateBoundedLimit,
  validateDate,
  validateDates,
  validateDebugAddress,
  validateDiscourseWebhookSignature,
  validateEventFilters,
  validateId,
  validateIsDaoCouncil,
  validateProposalFields,
  validateProposalSnapshotId,
  validateRequiredString,
  validateRequiredStrings,
  validateStatusUpdate,
} from './validations'

const VALID_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const OTHER_VALID_ADDRESS = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'

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

describe('validateAddress', () => {
  describe('when the address is a valid ethereum address', () => {
    it('should return it unchanged, preserving the original casing', () => {
      expect(validateAddress(VALID_ADDRESS)).toBe(VALID_ADDRESS)
    })
  })

  describe('when the address is missing', () => {
    it('should throw an invalid address error', () => {
      expect(() => validateAddress(undefined)).toThrow('Invalid address')
    })
  })

  describe('when the address is an empty string', () => {
    it('should throw an invalid address error', () => {
      expect(() => validateAddress('')).toThrow('Invalid address')
    })
  })

  describe('when the address is not an ethereum address', () => {
    it('should throw an invalid address error', () => {
      expect(() => validateAddress('not-an-address')).toThrow('Invalid address')
    })
  })

  // The notification feed interpolates this value into a CAIP id and an outbound Push URL, so a
  // path-traversal or query-injection payload must never get through.
  describe('when the address carries url or path characters', () => {
    it('should reject a traversal payload', () => {
      expect(() => validateAddress('../../etc/passwd')).toThrow('Invalid address')
    })

    it('should reject a query-injection payload appended to a valid address', () => {
      expect(() => validateAddress(`${VALID_ADDRESS}?env=staging`)).toThrow('Invalid address')
    })
  })
})

describe('validateAddresses', () => {
  describe('when every entry is a valid address', () => {
    it('should not throw', () => {
      expect(() => validateAddresses([VALID_ADDRESS, OTHER_VALID_ADDRESS])).not.toThrow()
    })
  })

  describe('when the value is not an array', () => {
    it('should throw an invalid addresses error', () => {
      expect(() => validateAddresses('not-an-array' as unknown as string[])).toThrow('Invalid addresses')
    })
  })

  describe('when one entry is not a valid address', () => {
    it('should throw an invalid address error for that entry', () => {
      expect(() => validateAddresses([VALID_ADDRESS, 'nope'])).toThrow('Invalid address')
    })
  })
})

describe('validateBoundedAddresses', () => {
  describe('when the list is within the cap and every entry is valid', () => {
    it('should return the list', () => {
      expect(validateBoundedAddresses([VALID_ADDRESS])).toEqual([VALID_ADDRESS])
    })
  })

  describe('when the list is empty', () => {
    it('should return it, leaving the emptiness check to the caller', () => {
      expect(validateBoundedAddresses([])).toEqual([])
    })
  })

  describe('when the list holds exactly the maximum number of addresses', () => {
    it('should accept it', () => {
      const addresses = new Array(MAX_ADDRESSES_PER_REQUEST).fill(VALID_ADDRESS)
      expect(validateBoundedAddresses(addresses)).toHaveLength(MAX_ADDRESSES_PER_REQUEST)
    })
  })

  describe('when the list exceeds the maximum number of addresses', () => {
    it('should reject it rather than forward an unbounded array to snapshot', () => {
      const addresses = new Array(MAX_ADDRESSES_PER_REQUEST + 1).fill(VALID_ADDRESS)
      expect(() => validateBoundedAddresses(addresses)).toThrow('Too many addresses')
    })
  })

  describe('when the value is not an array', () => {
    it('should throw an invalid addresses error', () => {
      expect(() => validateBoundedAddresses({ length: 1 })).toThrow('Invalid addresses')
    })
  })

  describe('when the list holds a non-address entry', () => {
    it('should reject it before forwarding', () => {
      expect(() => validateBoundedAddresses([VALID_ADDRESS, 'nope'])).toThrow('Invalid address')
    })
  })
})

describe('validateBoundedLimit', () => {
  describe('when the limit is absent', () => {
    it('should return undefined so the client default applies', () => {
      expect(validateBoundedLimit(undefined)).toBeUndefined()
    })
  })

  describe('when the limit is a valid integer within the cap', () => {
    it('should return it', () => {
      expect(validateBoundedLimit(5)).toBe(5)
    })
  })

  describe('when the limit is exactly the maximum', () => {
    it('should accept it', () => {
      expect(validateBoundedLimit(MAX_PENDING_PROPOSALS_LIMIT)).toBe(MAX_PENDING_PROPOSALS_LIMIT)
    })
  })

  describe('when the limit exceeds the maximum', () => {
    it('should reject it rather than ask snapshot for an unbounded page', () => {
      expect(() => validateBoundedLimit(MAX_PENDING_PROPOSALS_LIMIT + 1)).toThrow('Invalid limit')
    })
  })

  describe('when the limit is zero or negative', () => {
    it('should reject zero', () => {
      expect(() => validateBoundedLimit(0)).toThrow('Invalid limit')
    })

    it('should reject a negative limit', () => {
      expect(() => validateBoundedLimit(-1)).toThrow('Invalid limit')
    })
  })

  describe('when the limit is not an integer', () => {
    it('should reject a fractional limit', () => {
      expect(() => validateBoundedLimit(1.5)).toThrow('Invalid limit')
    })

    it('should reject a numeric string', () => {
      expect(() => validateBoundedLimit('10')).toThrow('Invalid limit')
    })

    it('should reject null, which would reach the graphql query as a non-null violation', () => {
      expect(() => validateBoundedLimit(null)).toThrow('Invalid limit')
    })

    it('should reject Infinity', () => {
      expect(() => validateBoundedLimit(Infinity)).toThrow('Invalid limit')
    })

    it('should reject NaN', () => {
      expect(() => validateBoundedLimit(NaN)).toThrow('Invalid limit')
    })
  })
})

describe('validateDate', () => {
  describe('when the date is a parseable string', () => {
    it('should return it', () => {
      expect(validateDate('2024-01-31T00:00:00.000Z')).toBe('2024-01-31T00:00:00.000Z')
    })
  })

  describe('when the date is missing and not marked optional', () => {
    it('should throw an invalid date error', () => {
      expect(() => validateDate(undefined)).toThrow('Invalid date')
    })
  })

  describe('when the date is missing and marked optional', () => {
    it('should return undefined without throwing', () => {
      expect(validateDate(undefined, 'optional')).toBeUndefined()
    })
  })

  describe('when the date is present but unparseable', () => {
    it('should throw even when marked optional', () => {
      expect(() => validateDate('not-a-date', 'optional')).toThrow('Invalid date')
    })
  })
})

describe('validateDates', () => {
  describe('when both dates are parseable', () => {
    it('should return them as Date instances', () => {
      const { validatedStart, validatedEnd } = validateDates('2024-01-01', '2024-02-01')
      expect([validatedStart.toISOString(), validatedEnd.toISOString()]).toEqual([
        new Date('2024-01-01').toISOString(),
        new Date('2024-02-01').toISOString(),
      ])
    })
  })

  describe('when either date is unparseable', () => {
    it('should throw for an invalid start', () => {
      expect(() => validateDates('nope', '2024-02-01')).toThrow('Invalid date')
    })

    it('should throw for an invalid end', () => {
      expect(() => validateDates('2024-01-01', 'nope')).toThrow('Invalid date')
    })
  })
})

describe('isValidDate', () => {
  describe('when the value is a parseable date', () => {
    it('should return true', () => {
      expect(isValidDate('2024-01-01')).toBe(true)
    })
  })

  describe('when the value is empty or unparseable', () => {
    it('should return false for an empty string', () => {
      expect(isValidDate('')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false)
    })

    it('should return false for a non-date string', () => {
      expect(isValidDate('nope')).toBe(false)
    })
  })
})

describe('validateProposalFields', () => {
  describe('when every field is a known snapshot proposal field', () => {
    it('should not throw', () => {
      expect(() => validateProposalFields(['id', 'scores_total'])).not.toThrow()
    })
  })

  describe('when the list contains an unknown field', () => {
    // These names are interpolated into the outbound Snapshot GraphQL query.
    it('should reject it', () => {
      expect(() => validateProposalFields(['id', 'not_a_field'])).toThrow('Invalid fields')
    })

    it('should reject a graphql injection attempt', () => {
      expect(() => validateProposalFields(['id { __schema }'])).toThrow('Invalid fields')
    })
  })

  describe('when the list is empty', () => {
    it('should reject it', () => {
      expect(() => validateProposalFields([])).toThrow('Invalid fields')
    })
  })

  describe('when the value is not an array', () => {
    it('should reject a string', () => {
      expect(() => validateProposalFields('id')).toThrow('Invalid fields')
    })

    it('should reject undefined', () => {
      expect(() => validateProposalFields(undefined)).toThrow('Invalid fields')
    })
  })
})

describe('validateProposalSnapshotId', () => {
  describe('when the id is a non-empty string', () => {
    it('should return it', () => {
      expect(validateProposalSnapshotId('snapshot-id')).toBe('snapshot-id')
    })
  })

  describe('when the id is missing or empty', () => {
    it('should throw for undefined', () => {
      expect(() => validateProposalSnapshotId(undefined)).toThrow('Invalid snapshot id')
    })

    it('should throw for an empty string', () => {
      expect(() => validateProposalSnapshotId('')).toThrow('Invalid snapshot id')
    })
  })
})

describe('validateRequiredString', () => {
  describe('when the value is a non-empty string', () => {
    it('should not throw', () => {
      expect(() => validateRequiredString('title', 'a title')).not.toThrow()
    })
  })

  describe('when the value is missing or empty', () => {
    it('should name the offending field for undefined', () => {
      expect(() => validateRequiredString('title', undefined)).toThrow('title')
    })

    it('should name the offending field for an empty string', () => {
      expect(() => validateRequiredString('title', '')).toThrow('title')
    })
  })
})

describe('validateRequiredStrings', () => {
  describe('when every named field is present', () => {
    it('should not throw', () => {
      expect(() => validateRequiredStrings(['a', 'b'], { a: 'x', b: 'y' })).not.toThrow()
    })
  })

  describe('when one named field is missing', () => {
    it('should name the missing field', () => {
      expect(() => validateRequiredStrings(['a', 'b'], { a: 'x' })).toThrow('b')
    })
  })
})

describe('stringToBoolean', () => {
  describe('when the value is a recognised truthy word', () => {
    it('should accept true, 1 and yes in any casing or spacing', () => {
      expect([stringToBoolean('TRUE'), stringToBoolean('1'), stringToBoolean(' yes ')]).toEqual([true, true, true])
    })
  })

  describe('when the value is a recognised falsy word', () => {
    it('should accept false, 0 and no', () => {
      expect([stringToBoolean('False'), stringToBoolean('0'), stringToBoolean('no')]).toEqual([false, false, false])
    })
  })

  describe('when the value is not a recognised boolean', () => {
    it('should throw for an arbitrary string', () => {
      expect(() => stringToBoolean('maybe')).toThrow('Invalid boolean value')
    })

    it('should throw for an empty string', () => {
      expect(() => stringToBoolean('')).toThrow('Invalid boolean value')
    })
  })
})

describe('validateIsDaoCouncil', () => {
  // The council list comes from the environment and is empty in tests, so every caller here is a
  // non-council wallet. That is the property the council-only routes rely on.
  describe('when the caller is not a dao council member', () => {
    it('should reject a signed but unprivileged wallet', () => {
      expect(() => validateIsDaoCouncil(VALID_ADDRESS)).toThrow()
    })
  })
})

describe('the webhook signature validators without a configured secret', () => {
  // DISCOURSE_WEBHOOK_SECRET and ALCHEMY_DELEGATIONS_WEBHOOK_SECRET are unset in tests, so both
  // endpoints must refuse rather than verify against an empty key. The signature comparison itself
  // is covered in validations.webhookSignatures.test.ts, which pins the secrets.
  const request = { get: () => undefined, body: {} } as unknown as Request

  describe('when the discourse secret is not configured', () => {
    it('should report the endpoint as disabled', () => {
      expect(() => validateDiscourseWebhookSignature(request)).toThrow('Endpoint disabled')
    })
  })

  describe('when the alchemy secret is not configured', () => {
    it('should report the endpoint as disabled', () => {
      expect(() => validateAlchemyWebhookSignature(request)).toThrow('Endpoint disabled')
    })
  })
})

describe('validateDebugAddress', () => {
  // DEBUG_ADDRESSES is empty in tests, so every caller is a non-debug wallet here. That is the
  // security property GET /debug relies on: a valid signature from any wallet is not enough to read
  // the admin address list.
  describe('when the caller is not a debug address', () => {
    it('should reject a signed but unprivileged wallet', () => {
      expect(() => validateDebugAddress(VALID_ADDRESS)).toThrow('Invalid user')
    })

    it('should reject an unauthenticated caller', () => {
      expect(() => validateDebugAddress(undefined)).toThrow('Invalid user')
    })
  })
})
