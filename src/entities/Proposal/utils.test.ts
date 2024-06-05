import { ProposalStatus } from './types'
import {
  canLinkProposal,
  isProposalDeletable,
  isProposalEnactable,
  isProposalStatus,
  isValidProposalStatusUpdate,
  proposalCanBePassedOrRejected,
  toProposalStatus,
} from './utils'

describe('isProposalStatus', () => {
  it('returns true for every proposal status', () => {
    Object.values(ProposalStatus).forEach((status) => expect(isProposalStatus(status)).toBe(true))
  })
  it('returns false for anything else', () => {
    expect(isProposalStatus('status')).toBe(false)
  })
})

describe('toProposalStatus', () => {
  it('returns a ProposalStatus for every proposal status string', () => {
    Object.values(ProposalStatus).forEach((status) =>
      expect(toProposalStatus(status.toString(), () => '')).toBe(status)
    )
  })
  it('calls the handler function for anything else', () => {
    expect(toProposalStatus('status', () => false)).toBe(false)
    expect(toProposalStatus('status', () => null)).toBe(null)
    expect(toProposalStatus('status', () => undefined)).toBe(undefined)
    expect(() =>
      toProposalStatus('status', () => {
        throw new Error('ProposalStatus invalid')
      })
    ).toThrowError('ProposalStatus invalid')
  })
})

describe('isValidUpdateProposalStatus', () => {
  it('returns true when current status is Finished and next status is Rejected, Passed, Enacted, or Out of Budget', () => {
    expect(isValidProposalStatusUpdate(ProposalStatus.Finished, ProposalStatus.Rejected)).toBe(true)
    expect(isValidProposalStatusUpdate(ProposalStatus.Finished, ProposalStatus.Passed)).toBe(true)
    expect(isValidProposalStatusUpdate(ProposalStatus.Finished, ProposalStatus.Enacted)).toBe(true)
    expect(isValidProposalStatusUpdate(ProposalStatus.Finished, ProposalStatus.OutOfBudget)).toBe(true)
  })

  it('can only update to Enacted from Passed, Enacted, or Finished', () => {
    expect(isValidProposalStatusUpdate(ProposalStatus.Passed, ProposalStatus.Enacted)).toBe(true)
    expect(isValidProposalStatusUpdate(ProposalStatus.Enacted, ProposalStatus.Enacted)).toBe(true)
    expect(isValidProposalStatusUpdate(ProposalStatus.Finished, ProposalStatus.Enacted)).toBe(true)

    expect(isValidProposalStatusUpdate(ProposalStatus.Active, ProposalStatus.Enacted)).toBe(false)
    expect(isValidProposalStatusUpdate(ProposalStatus.Rejected, ProposalStatus.Enacted)).toBe(false)
    expect(isValidProposalStatusUpdate(ProposalStatus.OutOfBudget, ProposalStatus.Enacted)).toBe(false)
    expect(isValidProposalStatusUpdate(ProposalStatus.Deleted, ProposalStatus.Enacted)).toBe(false)
  })

  it('returns false for Pending, Active, Rejected, OutOfBudget and Deleted statuses', () => {
    Object.values(ProposalStatus).forEach((status) => {
      expect(isValidProposalStatusUpdate(ProposalStatus.Pending, status)).toBe(false)
      expect(isValidProposalStatusUpdate(ProposalStatus.Active, status)).toBe(false)
      expect(isValidProposalStatusUpdate(ProposalStatus.Rejected, status)).toBe(false)
      expect(isValidProposalStatusUpdate(ProposalStatus.OutOfBudget, status)).toBe(false)
      expect(isValidProposalStatusUpdate(ProposalStatus.Deleted, status)).toBe(false)
    })
  })
})

describe('proposalCanBeDeleted', () => {
  it('should return true for active or pending proposals', () => {
    expect(isProposalDeletable(ProposalStatus.Active)).toBe(true)
    expect(isProposalDeletable(ProposalStatus.Pending)).toBe(true)
  })
  it('should return false for all status other than active or pending', () => {
    Object.values(ProposalStatus)
      .filter((status) => status !== ProposalStatus.Active && status !== ProposalStatus.Pending)
      .forEach((status) => {
        expect(isProposalDeletable(status)).toBe(false)
      })
  })
})

describe('proposalCanBeEnacted', () => {
  it('should return true for enacted or passed proposals', () => {
    expect(isProposalEnactable(ProposalStatus.Passed)).toBe(true)
    expect(isProposalEnactable(ProposalStatus.Enacted)).toBe(true)
  })
  it('should return false for all status other than active or pending', () => {
    Object.values(ProposalStatus)
      .filter((status) => status !== ProposalStatus.Passed && status !== ProposalStatus.Enacted)
      .forEach((status) => {
        expect(isProposalEnactable(status)).toBe(false)
      })
  })
})

describe('proposalCanBePassedOrRejected', () => {
  it('should only be true for finished proposals', () => {
    Object.values(ProposalStatus).forEach((status) => {
      expect(proposalCanBePassedOrRejected(status)).toBe(status === ProposalStatus.Finished)
    })
  })
})

describe('canLinkProposal', () => {
  it('should return true for passed or OOB proposals', () => {
    expect(canLinkProposal(ProposalStatus.Passed)).toBe(true)
    expect(canLinkProposal(ProposalStatus.OutOfBudget)).toBe(true)
  })
  it('should return false for all status other than passed or OOB', () => {
    Object.values(ProposalStatus)
      .filter((status) => status !== ProposalStatus.Passed && status !== ProposalStatus.OutOfBudget)
      .forEach((status) => {
        expect(canLinkProposal(status)).toBe(false)
      })
  })
})
