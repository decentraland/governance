import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo";
import fetch from "isomorphic-fetch";

const ENDPOINT = `https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot`
const QUERY = `
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

export type Delegation = {
  delegator: string,
  delegate: string,
  space: string
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

export function filterDelegationTo(delegations: Delegation[], space: string): Delegation[] {
  if (delegations.length > 1) {
    return delegations.filter(delegation => delegation.space === space)
  }

  return delegations
}

export function filterDelegationFrom(delegations: Delegation[], space: string): Delegation[] {
  if (delegations.length === 0) {
    return []
  }

  const unique_delegations = new Map<String, Delegation>()

  for (const deleg of delegations) {
    if (unique_delegations.has(deleg.delegator)) {
      if (unique_delegations.get(deleg.delegator)?.space !== space) {
        unique_delegations.set(deleg.delegator, deleg)
      }
    }
    else {
      unique_delegations.set(deleg.delegator, deleg)
    }
  }

  return Array.from(unique_delegations.values())
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
    const filteredDelegatedFrom = filterDelegationFrom(data.delegatedFrom, space)
    const result: DelegationResult = {
      delegatedTo: filterDelegationTo(data.delegatedTo, space),
      delegatedFrom: filteredDelegatedFrom.slice(0, 99),
      hasMoreDelegatedFrom: filteredDelegatedFrom.length > 99
    }

    return result
  }, [ space, address ], { initialValue, callWithTruthyDeps: true })
}