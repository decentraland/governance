import { ProposalAttributes } from '../Proposal/types'

export function getProposalsMinAndMaxDates(proposals: Pick<ProposalAttributes, 'start_at'>[]) {
  const sorted = proposals.sort((p1, p2) => p1.start_at.getTime() - p2.start_at.getTime())
  return { minDate: sorted[0].start_at, maxDate: sorted[sorted.length - 1].start_at }
}
