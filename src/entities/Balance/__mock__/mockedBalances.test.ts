import { ChainId } from '@dcl/schemas'
import { TokenAttributes } from '../../Token/types'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { WalletAttributes } from '../../Wallet/types'
import { BalanceAttributes } from '../types'

export const mockedTokens:TokenAttributes[] = [
  {
    "id": "1",
    "contract": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
    "network": 1,
    "name": "mana",
    "symbol": "MANA",
    "decimals": 18,
    "created_at": Time.date("2021-12-28 18:55:43.163498 +00:00")
  },
  {
    "id": "2",
    "contract": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    "network": 1,
    "name": "matic",
    "symbol": "MATIC",
    "decimals": 18,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "3",
    "contract": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "network": 1,
    "name": "dai",
    "symbol": "DAI",
    "decimals": 18,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "4",
    "contract": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "network": 1,
    "name": "tether",
    "symbol": "USDT",
    "decimals": 6,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "5",
    "contract": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "network": 1,
    "name": "usdc",
    "symbol": "USDC",
    "decimals": 6,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "6",
    "contract": "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
    "network": 137,
    "name": "mana",
    "symbol": "MANA",
    "decimals": 18,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "7",
    "contract": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    "network": 137,
    "name": "dai",
    "symbol": "DAI",
    "decimals": 18,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "8",
    "contract": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    "network": 137,
    "name": "tether",
    "symbol": "USDT",
    "decimals": 6,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "9",
    "contract": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "network": 137,
    "name": "usdc",
    "symbol": "USDC",
    "decimals": 6,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "10",
    "contract": "NATIVE",
    "network": 1,
    "name": "ether",
    "symbol": "ETH",
    "decimals": 18,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  },
  {
    "id": "11",
    "contract": "NATIVE",
    "network": 137,
    "name": "matic",
    "symbol": "MATIC",
    "decimals": 18,
    'created_at': Time.date('2021-12-28 18:55:43.163498 +00:00')
  }
]


export const token1: TokenAttributes = {
  id: 'token id 1',
  contract: 'token contract 1',
  network: ChainId.ETHEREUM_MAINNET,
  name: 'token name 1',
  symbol: 'token symbol 1',
  decimals: 18,
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const token2: TokenAttributes = {
  id: 'token id 2',
  contract: 'token contract 2',
  network: ChainId.ETHEREUM_MAINNET,
  name: 'token name 2',
  symbol: 'token symbol 2',
  decimals: 18,
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const ethereumWallet: WalletAttributes = {
  id: 'wallet id eth',
  address: 'eth wallet address',
  network: ChainId.ETHEREUM_MAINNET,
  name: 'eth wallet name',
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const maticWallet: WalletAttributes = {
  id: 'matic wallet id',
  address: 'matic wallet address',
  network: ChainId.MATIC_MAINNET,
  name: 'matic wallet name',
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export let mockedLatestBalances: BalanceAttributes[] = [
  {
    id: "8feb1440-6816-11ec-9a95-1bd702865daf",
    wallet_id: "1",
    token_id: "2",
    amount: "0x0000000000000000000000000000000000000000000000000000000055555555",
    created_at: Time.date("2021-12-28 19:44:25.476000 +00:00")
  },
  {
    id: "9235a080-6816-11ec-9a95-1bd702865daf",
    wallet_id: "1",
    token_id: "3",
    amount: "0x0000000000000000000000000000000000000000000153d102070746599ee535",
    created_at: Time.date("2021-12-28 19:44:29.321000 +00:00")
  },
  {
    id: "931bbac0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "1",
    token_id: "4",
    amount: "0x0000000000000000000000000000000000000000000000000000015141731305",
    created_at: Time.date("2021-12-28 19:44:30.828000 +00:00")
  },
  {
    id: "93ddf950-6816-11ec-9a95-1bd702865daf",
    wallet_id: "1",
    token_id: "5",
    amount: "0x0000000000000000000000000000000000000000000000000000010e39baf2d7",
    created_at: Time.date("2021-12-28 19:44:32.101000 +00:00")
  },
  {
    id: "aa8588d0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "1",
    token_id: "10",
    amount: "0x27007b89f926e00",
    created_at: Time.date("2021-12-28 19:45:10.109000 +00:00")
  },
  {
    id: "b9e38e30-6816-11ec-9a95-1bd702865daf",
    wallet_id: "2",
    token_id: "1",
    amount: "0x0000000000000000000000000000000000000000000000db4af39d52eb511800",
    created_at: Time.date("2021-12-28 19:45:35.891000 +00:00")
  },
  {
    id: "b9e562f0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "2",
    token_id: "2",
    amount: "0x0000000000000000000000000000000000000000000000000000000000000000",
    created_at: Time.date("2021-12-28 19:45:35.903000 +00:00")
  },
  {
    id: "b9e7ace0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "2",
    token_id: "3",
    amount: "0x0000000000000000000000000000000000000000000000000000000000000000",
    created_at: Time.date("2021-12-28 19:45:35.918000 +00:00")
  },
  {
    id: "b9e95a90-6816-11ec-9a95-1bd702865daf",
    wallet_id: "2",
    token_id: "4",
    amount: "0x000000000000000000000000000000000000000000000000000000746a528800",
    created_at: Time.date("2021-12-28 19:45:35.929000 +00:00")
  },
  {
    id: "b9eaba20-6816-11ec-9a95-1bd702865daf",
    wallet_id: "2",
    token_id: "5",
    amount: "0x0000000000000000000000000000000000000000000000000000000000000000",
    created_at: Time.date("2021-12-28 19:45:35.938000 +00:00")
  },
  {
    id: "c2dbd9c0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "2",
    token_id: "10",
    amount: "0x45132605275f1563",
    created_at: Time.date("2021-12-28 19:45:50.940000 +00:00")
  },
  {
    id: "ceea3ef0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "3",
    token_id: "6",
    amount: "0x000000000000000000000000000000000000000000008b66a9d1cbabb8b48000",
    created_at: Time.date("2021-12-28 19:46:11.167000 +00:00")
  },
  {
    id: "ceebeca0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "3",
    token_id: "7",
    amount: "0x0000000000000000000000000000000000000000000000024fd25cee47ba2000",
    created_at: Time.date("2021-12-28 19:46:11.178000 +00:00")
  },
  {
    id: "ceed7340-6816-11ec-9a95-1bd702865daf",
    wallet_id: "3",
    token_id: "8",
    amount: "0x0000000000000000000000000000000000000000000000000000000000000000",
    created_at: Time.date("2021-12-28 19:46:11.188000 +00:00")
  },
  {
    id: "ceee5da0-6816-11ec-9a95-1bd702865daf",
    wallet_id: "3",
    token_id: "9",
    amount: "0x000000000000000000000000000000000000000000000000000000000146eb68",
    created_at: Time.date("2021-12-28 19:46:11.194000 +00:00")
  },
  {
    id: "d01ec750-6816-11ec-9a95-1bd702865daf",
    wallet_id: "3",
    token_id: "11",
    amount: "0x4563918244f40000",
    created_at: Time.date("2021-12-28 19:46:13.189000 +00:00")
  },
  {
    id: "edd60c40-6816-11ec-9a95-1bd702865daf",
    wallet_id: "1",
    token_id: "1",
    amount: "0x00000000000000000000000000000000000000000019e96b1308538a0a1e6663",
    created_at: Time.date("2021-12-28 19:47:03.044000 +00:00")
  }
]

export const mockedWallets = [
  {
    "id": "1",
    "address": "0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce",
    "name": "Aragon Agent",
    "network": 1,
    'created_at': Time.date('2021-12-27 01:32:06.533142 +00:00')
  },
  {
    "id": "2",
    "address": "0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1",
    "name": "Gnosis Safe",
    "network": 1,
    'created_at': Time.date('2021-12-27 01:32:06.533142 +00:00')
  },
  {
    "id": "3",
    "address": "0xB08E3e7cc815213304d884C88cA476ebC50EaAB2",
    "name": "Gnosis Safe",
    "network": 137,
    'created_at': Time.date('2021-12-27 01:32:06.533142 +00:00')
  }
]
