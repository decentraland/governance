import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

const QUERY = `
query ($space: String!, $address: [Bytes!]) {
  delegatedFrom: delegations(
    where: {space_in: ["", $space], delegate_in: $address}
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
        const request = await fetch(SNAPSHOT_QUERY_ENDPOINT, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: QUERY,
            variables: { address: addresses, space: SNAPSHOT_SPACE },
          }),
        })

        const body = await request.json()
        const queryResult = body.data.delegatedFrom as DelegationQueryResult[]

        const pickedBy = new Map<string, Set<string>>()

        for (const addr of addresses) {
          const delegations = queryResult.filter((deleg) => deleg.delegate === addr)
          pickedBy.set(addr, new Set())

          if (delegations.length > 0) {
            for (const deleg of delegations) {
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
