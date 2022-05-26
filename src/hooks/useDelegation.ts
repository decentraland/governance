import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { EMPTY_DELEGATION, fetchAndFilterDelegates } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

const LATEST_DELEGATIONS_QUERY = `
query ($space: String!, $address: String!) {
  delegatedTo: delegations(where: { space_in: ["", $space], delegator: $address }, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    space
    timestamp
  },
  delegatedFrom: delegations(where: { space_in: ["", $space], delegate: $address }, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    space
    timestamp
  }
}
`

export default function useDelegation(address?: string | null) {
  return useAsyncMemo(
    async () => {
      if (!SNAPSHOT_SPACE || !address) {
        return EMPTY_DELEGATION
      }
      const variables = {
        address: address.toLowerCase(),
        space: SNAPSHOT_SPACE,
      }
      return await fetchAndFilterDelegates(LATEST_DELEGATIONS_QUERY, variables)
    },
    [SNAPSHOT_SPACE, address],
    { initialValue: EMPTY_DELEGATION, callWithTruthyDeps: true }
  )
}
