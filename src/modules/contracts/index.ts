import { ChainId } from '@dcl/schemas'

export { default as ERC20ABI } from './abi/ERC20.abi.json'
export { default as MiniMeABI } from './abi/MiniMe.abi.json'
export { default as RegisterABI } from './abi/Register.abi.json'

// MANA
export const MANA: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
  [ChainId.ETHEREUM_RINKEBY]: '0x28BcE5263f5d7F4EB7e8C6d5d78275CA455BAc63',
  [ChainId.ETHEREUM_GOERLI]: '0xe7fDae84ACaba2A5Ba817B6E6D8A2d415DBFEdbe',
}

export const wMANA: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xfd09cf7cfffa9932e33668311c4777cb9db3c9be',
  [ChainId.ETHEREUM_RINKEBY]: '0xfb2712a1246f712b889692c7ce55fec25c06bc33',
}

export const LAND: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
  [ChainId.ETHEREUM_GOERLI]: '0x25b6B4bac4aDB582a0ABd475439dA6730777Fbf7',
}

export const ESTATE: Record<number, string | null | undefined> = {
  [ChainId.ETHEREUM_MAINNET]: '0x959e104e1a4db6317fa58f8295f586e1a978c297',
  [ChainId.ETHEREUM_GOERLI]: '0xC9A46712E6913c24d15b46fF12221a79c4e251DC',
}
