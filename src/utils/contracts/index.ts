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

export enum ContractVersion {
  V1 = 'v1',
  V2 = 'v2',
}

type Topics = {
  RELEASE: string
  REVOKE: string
  TRANSFER_OWNERSHIP: string
  PAUSED: string
  UNPAUSED: string
}

export const TopicsByVersion: Record<ContractVersion, Topics> = {
  [ContractVersion.V1]: {
    RELEASE: '0xfb81f9b30d73d830c3544b34d827c08142579ee75710b490bab0b3995468c565',
    REVOKE: '0x44825a4b2df8acb19ce4e1afba9aa850c8b65cdb7942e2078f27d0b0960efee6',
    TRANSFER_OWNERSHIP: '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
    PAUSED: '0x0000000000000000000000000000000000000000000000000000000000000000',
    UNPAUSED: '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  [ContractVersion.V2]: {
    RELEASE: '0xb21fb52d5749b80f3182f8c6992236b5e5576681880914484d7f4c9b062e619e',
    REVOKE: '0x44825a4b2df8acb19ce4e1afba9aa850c8b65cdb7942e2078f27d0b0960efee6',
    TRANSFER_OWNERSHIP: '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0',
    PAUSED: '0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258',
    UNPAUSED: '0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa',
  },
}
