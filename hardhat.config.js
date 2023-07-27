const dotenv = require('dotenv')

dotenv.config()

// RPCs
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL
// Signers
const TESTING_PK = process.env.TESTING_PK || ''
const PRD_PK = process.env.PRD_PK || ''
// Rafts
const POLYGON_TEST_RAFT_ID = process.env.POLYGON_TEST_RAFT_ID
const POLYGON_PROD_RAFT_ID = process.env.POLYGON_PROD_RAFT_ID

var POLYGON_BLOCK_EXPLORER = process.env.POLYGON_BLOCK_EXPLORER
var POLYGON_RAFT_CONTRACT_ADDRESS = process.env.POLYGON_RAFTS_CONTRACT_ADDRESS
var POLYGON_BADGES_CONTRACT_ADDRESS = process.env.POLYGON_BADGES_CONTRACT_ADDRESS

module.exports = {
  defaultNetwork: 'polytest',
  networks: {
    hardhat: {},
    polytest: {
      url: POLYGON_RPC_URL,
      accounts: [TESTING_PK],
      raft_id: POLYGON_TEST_RAFT_ID,
      badgesContractAddress: POLYGON_BADGES_CONTRACT_ADDRESS,
      raftsContractAddress: POLYGON_RAFT_CONTRACT_ADDRESS,
      blockExplorer: POLYGON_BLOCK_EXPLORER,
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [PRD_PK],
      raft_id: POLYGON_PROD_RAFT_ID,
      badgesContractAddress: POLYGON_BADGES_CONTRACT_ADDRESS,
      raftsContractAddress: POLYGON_RAFT_CONTRACT_ADDRESS,
      blockExplorer: POLYGON_BLOCK_EXPLORER,
    },
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  tasks: {
    badges: {
      description: 'Airdrop badges.',
      action: require('./src/back/hardhat/badgesTasks'),
    },
  },
}
