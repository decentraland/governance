<p align="center">
  <a href="https://governance.decentraland.org">
    <img alt="Decentraland" src="https://decentraland.org/images/logo.png" width="60" />
  </a>
</p>
<h1 align="center">
  Decentraland DAO Governance dApp
</h1>

The governance hub for the Decentraland ecosystem. Create and vote on proposals that help shape the future of the metaverse via the Decentraland DAO (Decentralized Autonomous Organization).

![Screenshot of the governance hub for Decentraland homepage](./static/home.png)

# Setup
Before you start make sure you have installed:

- [Homebrew](https://brew.sh/)
- [Postgres](https://wiki.postgresql.org/wiki/Homebrew)

### Node version

use node >= `18`

If you are starting from scratch and you don't have Node installed in your computer, we recommend using a Node version manager like [nvm](https://github.com/nvm-sh/nvm) to install Node.js and npm instead of the Node installer.

`nvm install v18.8.0` will install node version 18 and the corresponding npm version.

**NOTE**

If you are using WSL (Windows Subsystem for Linux) as your development environment, clone the repository into the WSL filesystem. If you clone it inside the Windows filesystem, the project will not work.

Run `npm install` to install all the dependencies needed to run the project.

## Environment setup

Create a copy of `.env.example` and name it as `.env.development`

```bash
  cp .env.example .env.development
```

If you are running this project locally you only need to check the following environment variables:

- `CONNECTION_STRING`: make sure it points to a valid database (see how to create one in the 'Database Setup' section)
- `COMMITTEE_ADDRESSES`: list of eth addresses separated by `,` that will be able to enact finished proposals
- `DISCOURSE_API_KEY`: the api key use to publish the proposals on the forum
- `RPC_PROVIDER_URL`: the rpc provider to get the latest block
- `BLOCKNATIVE_API_KEY`: api key for [blocknative](https://www.blocknative.com/), a polygon tx gas estimation service we use for calculating airdrops gas fees accurately
- Snapshot env vars: see snapshot setup

### Setup the required voting power to pass

The minimum amount of voting power require to pass a proposal of each type it's defined in these variables, if they are not defined or are not numbers `0` will be used instead

```bash
  GATSBY_VOTING_POWER_TO_PASS_LINKED_WEARABLES=0
  GATSBY_VOTING_POWER_TO_PASS_CATALYST=0
  GATSBY_VOTING_POWER_TO_PASS_BAN_NAME=0
  GATSBY_VOTING_POWER_TO_PASS_POI=0
  GATSBY_VOTING_POWER_TO_PASS_POLL=0
```

## Database setup

Make sure you have Postgres installed and running:

```shell
brew install postgresql@14
brew services start postgresql@14
createdb
```

You can create a DB from scratch, or you can use the `import-db.sh` script to create a new DB using the `development.dump` dump.

### Importing DB dump

```bash
cd scripts/
bash ./import-db.sh USERNAME [DATABASE_NAME] [DUMP_FILE]
```

If no DATABASE_NAME and DUMP_FILE arguments are given, the script will use the default values and create a `governance` db using the `development.dump` dump.
The CONNECTION_STRING should look like this:

```bash
postgres://USERNAME:PASSWORD@localhost:5432/governance
```

(the default password should be `postgres`)

### Creating DB from scratch

To create a DB, run in the terminal

```bash
createdb -U YOUR_USER DATABASE_NAME
```

The default postgres user is `postgres` or your username, and the default password is `postgres`.
Use your user and password for the connection string variable, it should look like this:

```bash
postgres://YOUR_USER:YOUR_PASSWORD@localhost:5432/DATABASE_NAME
```

Once you have a `CONNECTION_STRING` you can set up your database tables using the following command:

```bash
npm run migrate up
```

## Snapshot Setup

- `GATSBY_SNAPSHOT_SPACE`: the snapshot space where the proposals will be published
- `SNAPSHOT_PRIVATE_KEY`, `GATSBY_SNAPSHOT_ADDRESS`: a pair address/key with permissions to publish at that snapshot space
- The configured SNAPSHOT_PROPOSAL_TYPE for the project is 'single-choice', which means each voter may select only one choice. See [available voting systems](https://docs.snapshot.org/proposals/voting-types#single-choice-voting)

### Creating a Snapshot space

You are going to need to register an ENS name in the network you'll create the space in. Follow instructions on [Snapshot](https://docs.snapshot.org/spaces/create).

#### Strategy

- DCL Governance uses several strategies:

  - [erc20-balance-of](https://snapshot.org/#/playground/erc20-balance-of)

  - [delegation](https://testnet.snapshot.org/#/strategy/delegation)

  ```json
  {
    "symbol": "VP (delegated)",
    "strategies": [
      {
        "name": "erc20-balance-of",
        "params": {
          "symbol": "MANA",
          "address": "0x The address of the token contract on the network you are using",
          "decimals": 18
        }
      }
    ],
    "delegationSpace": "yourEnsName.eth"
  }
  ```

  - [erc721-with-multiplier](https://snapshot.org/#/playground/erc721-with-multiplier)

  ```json
  {
    "symbol": "LAND",
    "address": "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d",
    "multiplier": 2000
  }
  ```

  - [erc721-with-multiplier](https://snapshot.org/#/playground/erc721-with-multiplier)

  ```json
  {
    "symbol": "NAMES",
    "address": "0x2a187453064356c898cae034eaed119e1663acb8",
    "multiplier": 100
  }
  ```

  - [decentraland-estate-size](https://snapshot.org/#/playground/decentraland-estate-size)

  ```json
  {
    "symbol": "ESTATE",
    "address": "0x959e104e1a4db6317fa58f8295f586e1a978c297",
    "multiplier": 2000
  }
  ```

  -[multichain](https://snapshot.org/#/playground/multichain)

  ```json
  {
    "name": "multichain",
    "graphs": {
      "137": "https://api.thegraph.com/subgraphs/name/decentraland/blocks-matic-mainnet"
    },
    "symbol": "MANA",
    "strategies": [
      {
        "name": "erc20-balance-of",
        "params": {
          "address": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
          "decimals": 18
        },
        "network": "1"
      },
      {
        "name": "erc20-balance-of",
        "params": {
          "address": "0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4",
          "decimals": 18
        },
        "network": "137"
      }
    ]
  }
  ```

If you need MANA for testing you can get it by interacting with the contract on etherscan

[Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

[Sepolia FakeMana](https://sepolia.etherscan.io/address/0xfa04d2e2ba9aec166c93dfeeba7427b2303befa9#writeContract)

Connect your wallet and use the `mint` method on the `Contract -> Write Contract` section

- `to (address)` is your address
- `amount (uint256)` is whatever you want. Take into account that `1000000000000000000 = 1 MANA`

Take into account that the voting power distribution response from snapshot returns an array with each voting power.
The order in which each value is returned depends on the order in which strategies are added to the space on the [space settings](https://snapshot.org/#/snapshot.dcl.eth/settings)

#### Current Strategies Order

- WMANA
- LAND
- ESTATE
- MANA
- NAMES
- DELEGATED
- WEARABLE

# Test

To run the tests you can do

```bash
npm test
```

or create a run configuration in your IDE with `jest --no-cache --no-watchman --runInBand`

Also, you can try adding the `--verbose` option.

The `--runInBand` parameter runs the tests in a single thread, which is usually faster, but you can try without it
and see what works best for you.

# Run

Once you setup this project you can start it using the following command

```bash
  npm start
```

> Note 1: this project run over `https`, if it is your first time you might need to run it with `sudo`

> Note 2: you can disabled `https` removing the `--https` flag in the `develop` script of your `package.json`

the app should be running at https://localhost:4000/


# About
### Routes

The routes are defined using `express` you can find each route in `src/routes` and those are imported at `src/server.ts`

### Types and Utils

Types and Utils contain functions and types that will be useful across the whole project.

### Proposals statuses

- Proposals are created in pending, and automatically passed to active
- After a voting period of 1 week, they are automatically marked as finished, passed, or rejected, depending on the kind of proposal and of the voting results.
- If proposal is in finished status, a committee user can pass/reject it, with a comment.
- Once passed, a proposal can be enacted by a committee user, with a comment.

### Voting results

- Voting results are calculated in two different ways, for different purposes:
  - `Votes/utils.ts` calculates the results in a user-friendly way. These results are rounded up for clarity.
  - `Proposal/jobs.ts` has a more exact calculation, and is used to evaluate the real result of the voting

## Copyright & License

This repository is protected with a standard Apache 2 license. See the terms and conditions in the [LICENSE](LICENSE) file.
