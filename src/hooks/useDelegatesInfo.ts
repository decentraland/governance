import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import fetch from 'isomorphic-fetch'
import { useMemo } from 'react'
import { SNAPSHOT_QUERY_ENDPOINT, SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import useVotingPowerBalance from './useVotingPowerBalance'

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

export type Delegate = {
  address: string
  pickedBy: number
  totalVP: number
}

function getTotalVP(addresses: string[]) {
  return addresses.map(addr => {
    const [votingPower] = useVotingPowerBalance(addr, SNAPSHOT_SPACE)
    return { [addr]: votingPower }
  }).reduce((obj, item) => Object.assign(obj, item), {})
}

function getPickedBy(addresses: string[]) {
  const initialValue: PickedByResult[] = []
  return useAsyncMemo(async () => {
    if (addresses.length === 0 || SNAPSHOT_SPACE === '') {
      return initialValue
    }

    const request = await fetch(
      SNAPSHOT_QUERY_ENDPOINT,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: QUERY,
          variables: { address: addresses, space: SNAPSHOT_SPACE },
        }),
      }
    )

    const body = await request.json()
    const queryResult = body.data.delegatedFrom as DelegationQueryResult[]

    const pickedBy = new Map<string, Set<string>>()

    for (const addr of addresses) {

      const delegations = queryResult.filter(deleg => deleg.delegate === addr)
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

  }, [], { initialValue, callWithTruthyDeps: true })
}

function useDelegatesInfo(addresses: string[]): Delegate[] {

  addresses = addresses.map(addr => addr.toLowerCase())

  const totalVotingPower = getTotalVP(addresses)
  const [pickedByResults] = getPickedBy(addresses)

  return useMemo(
    () => pickedByResults.map(delegate => ({ ...delegate, totalVP: totalVotingPower[delegate.address] })),
    [JSON.stringify(pickedByResults), JSON.stringify(totalVotingPower)]
  )
}

export default useDelegatesInfo