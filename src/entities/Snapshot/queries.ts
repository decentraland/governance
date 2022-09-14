export const DELEGATIONS_ON_PROPOSAL_QUERY = `
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

export const LATEST_DELEGATIONS_QUERY = `
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
