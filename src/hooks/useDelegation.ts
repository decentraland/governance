import fetch from "isomorphic-fetch";
import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo";

const ENDPOINT = `https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot`
const QUERY = `
query ($space: String!, $address: String!) {
  delegatedTo: delegations(where: { space: $space, delegator: $address }, first: 1, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    timestamp
  },

  delegatedFrom: delegations(where: { space: $space, delegate: $address }, first: 100, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    timestamp
  }
}
`

export type Delegation = {
  delegator: string,
  delegate: string,
}

export type DelegationQueryResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
}

export type DelegationResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
  hasMoreDelegatedFrom: boolean
}

const initialValue: DelegationResult = {
  delegatedTo: [],
  delegatedFrom: [],
  hasMoreDelegatedFrom: false,
}

export default function useDelegation(address?: string | null, space?: string | null) {
  return useAsyncMemo(async () => {
    if (!space || !address) {
      return initialValue
    }

    const request = await fetch(
      ENDPOINT,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: QUERY,
          variables: { address: address.toLowerCase(), space },
        }),
      }
    )
    const body = await request.json()
    const data = body.data as DelegationQueryResult
    const result: DelegationResult = {
      delegatedTo: data.delegatedTo,
      delegatedFrom: data.delegatedFrom.slice(0,99),
      hasMoreDelegatedFrom: data.delegatedFrom.length > 99
    }

    return result
  }, [ space, address ], { initialValue, callWithTruthyDeps: true })
}