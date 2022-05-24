import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { EMPTY_DELEGATION, fetchAndFilterDelegates } from '../api/Snapshot'

import { ProposalAttributes } from '../entities/Proposal/types'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

const DELEGATIONS_ON_PROPOSAL_QUERY = `
query ($space: String!, $address: String!, $blockNumber: Int) {
  delegatedTo: delegations(block:{number: $blockNumber},where: { space_in: ["", $space], delegator: $address }, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    space
    timestamp
  },
  delegatedFrom: delegations(block:{number: $blockNumber},where: { space_in: ["", $space], delegate: $address }, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    space
    timestamp
  }
}`

export default function useDelegationOnProposal(proposal?: ProposalAttributes | null, address?: string | null) {
  return useAsyncMemo(
    async () => {
      if (!SNAPSHOT_SPACE || !address || !proposal) {
        return EMPTY_DELEGATION
      }
      const variables = {
        address: address.toLowerCase(),
        space: SNAPSHOT_SPACE,
        blockNumber: proposal.snapshot_proposal.snapshot,
      }
      return await fetchAndFilterDelegates(DELEGATIONS_ON_PROPOSAL_QUERY, variables)
    },
    [SNAPSHOT_SPACE, address, proposal],
    { initialValue: EMPTY_DELEGATION, callWithTruthyDeps: true }
  )
}
