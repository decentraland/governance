import { ChainId } from '@dcl/schemas'

export { default as ERC20ABI } from './abi/ERC20.abi.json'
export { default as MiniMeABI } from './abi/MiniMe.abi.json'
export { default as RegisterABI } from './abi/Register.abi.json'

// MANA
export const MANA: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  [ChainId.ETHEREUM_SEPOLIA]: '0xfa04d2e2ba9aec166c93dfeeba7427b2303befa9',
}

export const wMANA: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xfd09cf7cfffa9932e33668311c4777cb9db3c9be',
  [ChainId.ETHEREUM_RINKEBY]: '0xfb2712a1246f712b889692c7ce55fec25c06bc33',
}

export const LAND: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
  [ChainId.ETHEREUM_SEPOLIA]: '0x42f4ba48791e2de32f5fbf553441c2672864bb33',
}

export const ESTATE: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x959e104e1a4db6317fa58f8295f586e1a978c297',
  [ChainId.ETHEREUM_SEPOLIA]: '0x369a7fbe718c870c79f99fb423882e8dd8b20486',
}
