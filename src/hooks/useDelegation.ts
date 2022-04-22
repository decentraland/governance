import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import fetch from 'isomorphic-fetch'

import { SNAPSHOT_QUERY_ENDPOINT } from '../entities/Snapshot/constants'

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
    if (unique_delegations.has(deleg.delegate)) {
      if (unique_delegations.get(deleg.delegate)?.space !== space) {
        unique_delegations.set(deleg.delegate, deleg)
      }
    }
    else {
      unique_delegations.set(deleg.delegate, deleg)
    }
  }

  return Array.from(unique_delegations.values())
}

const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''

export default function useDelegation(address?: string | null) {
  return useAsyncMemo(async () => {
    if (!SNAPSHOT_SPACE || !address) {
      return initialValue
    }

    const request = await fetch(
      SNAPSHOT_QUERY_ENDPOINT,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: QUERY,
          variables: { address: address.toLowerCase(), space: SNAPSHOT_SPACE },
        }),
      }
    )
    const body = await request.json()
    const data = body.data as DelegationQueryResult
    const filteredDelegatedFrom = filterDelegationFrom(data.delegatedFrom, SNAPSHOT_SPACE)
    const result: DelegationResult = {
      delegatedTo: filterDelegationTo(data.delegatedTo, SNAPSHOT_SPACE),
      delegatedFrom: filteredDelegatedFrom.slice(0, 99),
      hasMoreDelegatedFrom: filteredDelegatedFrom.length > 99
    }

    return result
  }, [SNAPSHOT_SPACE, address], { initialValue, callWithTruthyDeps: true })
}