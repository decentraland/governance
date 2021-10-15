import { ChainId } from '@dcl/schemas'
export { default as ERC20ABI } from './abi/ERC20.abi.json'
export { default as MiniMeABI } from './abi/MiniMe.abi.json'
export { default as RegisterABI } from './abi/Register.abi.json'

// MANA
export const MANA: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  [ChainId.MATIC_MAINNET]: '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4'
}

export const wMANA: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xfd09cf7cfffa9932e33668311c4777cb9db3c9be'
}

export const LAND: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d'
}

export const ESTATE: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x959e104e1a4db6317fa58f8295f586e1a978c297'
}

// STABLES

export const USDC: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
}

export const USDT: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xdac17f958d2ee523a2206206994597c13d831ec7'
}

export const DAI: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x6b175474e89094c44da98b954eedeac495271d0f'
}

// TREASURY
export const DAO: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce'
}

export const DAOCommittee: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1',
  [ChainId.MATIC_MAINNET]: '0xB08E3e7cc815213304d884C88cA476ebC50EaAB2'
}
