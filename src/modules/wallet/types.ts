export enum Network {
  MAINNET = 1,
  RINKEBY = 4
}

export const NetworkName = {
  [Network.MAINNET]: "mainnet",
  [Network.RINKEBY]: "rinkeby"
}

// # Aragon Rinkeby
// REACT_APP_ORGANIZATION_LOCATION=dcl.aragonid.eth
// REACT_APP_ORGANIZATION_CONNECTOR=thegraph
// REACT_APP_ORGANIZATION_NETWORK=4

// REACT_APP_VOTING_TIME=10080
// REACT_APP_VOTING_APP_NAME=voting.aragonpm.eth
// REACT_APP_VOTING_GRAPH=https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby

// # Aragon Rinkeby
// # REACT_APP_ORGANIZATION_LOCATION=dcl.eth
// # REACT_APP_ORGANIZATION_CONNECTOR=thegraph
// # REACT_APP_ORGANIZATION_NETWORK=1

// # REACT_APP_VOTING_TIME=10080
// # REACT_APP_VOTING_APP_NAME=voting.aragonpm.eth
// # REACT_APP_VOTING_GRAPH=https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-mainnet
