import { ChainId } from '@dcl/schemas'
export { default as ERC20ABI } from './abi/ERC20.abi.json'
export { default as MiniMeABI } from './abi/MiniMe.abi.json'
export { default as RegisterABI } from './abi/Register.abi.json'

// MANA
export const MANAToken: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  [ChainId.ETHEREUM_RINKEBY]: '0x28bce5263f5d7f4eb7e8c6d5d78275ca455bac63'
}

// wMANA
// WrappedMana
export const MANAMiniMeToken: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xfd09cf7cfffa9932e33668311c4777cb9db3c9be',
  [ChainId.ETHEREUM_RINKEBY]: '0xfb2712a1246f712b889692c7ce55fec25c06bc33'
}

export const LANDProxy: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
  [ChainId.ETHEREUM_RINKEBY]: null
}

export const LANDRegistry: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xa57e126b341b18c262ad25b86bb4f65b5e2ade45',
  [ChainId.ETHEREUM_RINKEBY]: '0xbeea8bfb0e582be1c3fb464824e61c218ba0c1b1'
}

export const EstateProxy: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x959e104e1a4db6317fa58f8295f586e1a978c297',
  [ChainId.ETHEREUM_RINKEBY]: null
}

export const EstateRegistry: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x124bf28a423b2ca80b3846c3aa0eb944fe7ebb95',
  [ChainId.ETHEREUM_RINKEBY]: '0x3f0b58ad7a8b27d0e5573cd1ca7d456e2f6d4884'
}
