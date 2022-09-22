import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

const QUERY = `
query PickedBy($space: String!, $address: [Bytes!], $first: Int!, $skip: Int!) {
  delegatedFrom: delegations(
    where: {space_in: ["", $space], delegate_in: $address},
    first: $first, skip: $skip,
    orderBy: delegate
    orderDirection: desc
  ) {
    delegator
    delegate
    space
    timestamp
  }
}
`

type DelegationQueryResult = {
  delegator: string
  delegate: string
  space: string
}

type PickedByResult = {
  address: string
  pickedBy: number
}

function usePickedBy(addresses: string[]) {
  const initialValue: PickedByResult[] = []
  const [pickedBy, state] = useAsyncMemo(
    async () => {
      if (addresses.length === 0 || SNAPSHOT_SPACE === '') {
        return initialValue
      }

      try {
        let hasNext = true
        let skip = 0
        const first = 500

        let delegations: DelegationQueryResult[] = []
        while (hasNext) {
          const response = await fetch(SNAPSHOT_QUERY_ENDPOINT, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: QUERY,
              variables: { address: addresses, space: SNAPSHOT_SPACE, skip, first },
            }),
          })

          const body = await response.json()
          const currentDelegations = body?.data?.delegatedFrom || []
          delegations = [...delegations, ...currentDelegations]

          if (currentDelegations.length < first) {
            hasNext = false
          } else {
            skip = delegations.length
          }
        }

        const pickedBy = new Map<string, Set<string>>()

        for (const addr of addresses) {
          const filteredDelegations = delegations.filter((deleg) => deleg.delegate === addr)
          pickedBy.set(addr, new Set())

          if (filteredDelegations.length > 0) {
            for (const deleg of filteredDelegations) {
              pickedBy.get(deleg.delegate)?.add(deleg.delegator)
            }
          }
        }

        const result: PickedByResult[] = []

        for (const entry of pickedBy.entries()) {
          const address = entry[0]
          const pickedBy = entry[1].size
          result.push({ address, pickedBy })
        }

        return result
      } catch (error) {
        console.error(error)
        return initialValue
      }
    },
    [],
    { initialValue: initialValue, callWithTruthyDeps: true }
  )

  return { pickedByResults: pickedBy, isLoadingPickedBy: state.loading }
}

export default usePickedBy
