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

## Setup

Before you start make sure you have installed:

- [NodeJS](https://nodejs.dev/) that includes `npm`
- [Homebrew](https://brew.sh/)

### Node version

use node >= `16`

If you are starting from scratch and you don't have Node installed in your computer, we recommend using a Node version manager like [nvm](https://github.com/nvm-sh/nvm) to install Node.js and npm instead of the Node installer.

`nvm install node` will install the latest version of node and npm.

**NOTE**

If you are using WSL (Windows Subsystem for Linux) as your development environment, clone the repository into the WSL filesystem. If you clone it inside the Windows filesystem, the project will not work.

### environment setup

create a copy of `.env.example` and name it as `.env.development`

```bash
  cp .env.example .env.development
```

> to know more about this file see [the documentation](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/#defining-environment-variables)

if you are running this project locally you only need to check the following environment variables:

* `CONNECTION_STRING`: make sure it is point to a valid database
* `COMMITTEE_ADDRESSES`: list of eth addresses separated by `,` that will be able to enact finished proposals
* `DISCOURSE_API_KEY`: the api key use to publish the proposals on the forum
* `RPC_PROVIDER_URL`: the rpc provider to get the latest block
* Snapshot env vars: see snapshot setup

### setup the required voting power to pass

The minimum amount of voting power require to pass a proposal of each type it's defined in these variables, if they are not defined or are not numbers `0` will be used instead

```bash
  GATSBY_VOTING_POWER_TO_PASS_LINKED_WEARABLES=0
  GATSBY_VOTING_POWER_TO_PASS_GRANT=0
  GATSBY_VOTING_POWER_TO_PASS_CATALYST=0
  GATSBY_VOTING_POWER_TO_PASS_BAN_NAME=0
  GATSBY_VOTING_POWER_TO_PASS_POI=0
  GATSBY_VOTING_POWER_TO_PASS_POLL=0
```

### database setup

check if you have postgres installed

```bash
brew list
```

if you don't, install it (don't forget to `brew update`)

```bash
brew install postgres
```

start postgresql

```bash
brew services start postgresql
```

you can run this to check if everything is ok 
```bash
createdb `whoami` 
``` 

inside psql run `create database snapshot`

use your `user:pwd` for the connection string, it should look like this:

```bash
postgres://usr:pwd@localhost:5432/snapshot
````

If you installed postgres using brew, you might need to create a role for npm to run the migrations
To do so, run this in psql 
```sql
CREATE USER postgres SUPERUSER;
```

once you have a `CONNECTION_STRING` you can setup you database tables using the following command

```bash
npm run migrate up
```

if migrations are not running, or get stuck, please check that you are using node v12

### Snapshot Setup

* `GATSBY_SNAPSHOT_SPACE`: the snapshot space where the proposals will be published
* `SNAPSHOT_PRIVATE_KEY`, `GATSBY_SNAPSHOT_ADDRESS`: a pair address/key with permissions to publish at that snapshot space
* The configured SNAPSHOT_PROPOSAL_TYPE for the project is 'single-choice', which means each voter may select only one choice. See [available voting systems](https://docs.snapshot.org/proposals/voting-types#single-choice-voting)

#### Creating a Snapshot space

You are going to need to register an ENS name in the network you'll create the space in.
For this purpose, you are going to need ETH / Rinkeby ETH / Goerli ETH. Use the faucets to get it:

[Rinkeby Faucet](https://rinkebyfaucet.com/)

[Goerli Faucet](https://goerlifaucet.com/)

Then follow instructions on [Snapshot](https://docs.snapshot.org/spaces/create)

#### Strategy

- DCL Governance uses several strategies:
  - [erc20-balance-of](https://snapshot.org/#/playground/erc20-balance-of)
  
  - [delegation](https://demo.snapshot.org/#/strategy/delegation)
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

[Rinkeby FakeMana](https://rinkeby.etherscan.io/address/0x28bce5263f5d7f4eb7e8c6d5d78275ca455bac63#writeContract)

[Goerli FakeMana](https://goerli.etherscan.io/address/0xe7fdae84acaba2a5ba817b6e6d8a2d415dbfedbe)

Connect your wallet and use the `setBalance` method on the `Contract -> Write Contract` section

- `to (address)` is your address
- `amount (uint256)` is whatever you want. Take into account that `1000000000000000000 = 1 MANA`

## Run Tests

to run the tests you can do
```bash
npm test
``` 

or create a run configuration in your IDE with `jest --no-cache --no-watchman --runInBand` 

Also, you can try adding the `--verbose` option.

The `--runInBand` parameter runs the tests in a single thread, which is usually faster, but you can try without it 
and see what works best for you.

## Run

once you setup this project you can start it using the following command

```bash
  npm start
```

> Note 1: this project run over `https`, if it is your first time you might need to run it with `sudo`

> Note 2: you can disabled `https` removing the `--https` flag in the `develop` script of your `package.json`

the app should be running at https://localhost:8000/

## Clear 
To clear cache and update localization and internationalization renders, run

```bash
rm -r .cache
```

## Project's structure

You can find a full documentation about the project's structure in the [`decentraland-gatsby` repository](https://github.com/decentraland/decentraland-gatsby#project-structure)

### back and front ends

this project runs gatsby as front-end and a nodejs server as back-end both connected through a proxy

* locally this proxy is defined in [`gatsby-config.js` (`proxy` prop)](https://www.gatsbyjs.com/docs/api-proxy/#gatsby-skip-here)
* at servers this proxy is defined in `Pulumi.ts` (`servicePaths` prop)

### routes

**front-end** routes are defined using [gatsby routes](https://www.gatsbyjs.com/docs/reference/routing/creating-routes/#define-routes-in-srcpages) + [gatsby-plugin-intl](https://www.gatsbyjs.com/plugins/gatsby-plugin-intl/?=gatsby-plugin-intl), you can find each page in the `src/pages` directory

**back-end** routes are defined using `express` you can find each route in `src/entities/{Entity}/routes.ts` and those are imported ar `src/server.ts`

### Types and Utils

Types and Utils contain functions and types that will be accessible to both the backend and the frontend.

Be careful with what goes in here, because when webpack tries to compile everything for the frontend it won't have all the backend dependencies, which could result in an error (e.g. `ERROR #98123 WEBPACK`)

## About proposals statuses
- Proposals are created in pending, and automatically passed to active
- After a voting period of 1 week, they are automatically marked as finished, passed, or rejected, depending on the kind of proposal and of the voting results.
- If proposal is in finished status, a committee user can pass/reject it, with a comment.
- Once passed, a proposal can be enacted by a committee user, with a comment.

## About voting results
- Voting results are calculated in two different ways, for different purposes:
  - `Votes/utils.ts` calculates the results in a user-friendly way, so they can be displayed in the frontend. These results are rounded up for clarity. 
  - `Proposal/jobs.ts` has a more exact calculation, and is used to evaluate the real result of the voting

## Copyright & License

This repository is protected with a standard Apache 2 license. See the terms and conditions in the [LICENSE](LICENSE) file.
