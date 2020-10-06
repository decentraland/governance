import { App } from '@aragon/connect'
import { Network } from 'modules/wallet/types'

export const VOTING_GRAPH = {
  // [Network.MAINNET]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-mainnet',
  // [Network.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby',
  // [Network.MAINNET]: 'https://graph.backend.aragon.org/subgraphs/name/aragon/aragon-mainnet',
  [Network.MAINNET]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-mainnet',
  [Network.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby-staging'
}

export const INBOX = {
  [Network.MAINNET]: '0x0741ab50b28ed40ed81acc1867cf4d57004c29b6',
  [Network.RINKEBY]: '0x37187b0f2089b028482809308e776f92eeb7334e'
}

export const COMMUNITY = {
  [Network.MAINNET]: '0x2aa9074caa11e30838caf681d34b981ffd025a8b',
  [Network.RINKEBY]: '0x5616500b003475136ee6b0844896a2e1ccc68140'
}

export const SAB = {
  [Network.MAINNET]: '0x41e83d829459f99bf4ee2e26d0d79748fb16b94f',
  [Network.RINKEBY]: '0xbc1863a593aaebb40b4f43665de30174c9d3fe29'
}

export const POI = {
  [Network.MAINNET]: '0x0ef15a1c7a49429a36cb46d4da8c53119242b54e',
  [Network.RINKEBY]: '0xde839e6cee47d9e24ac12e9215b7a45112923141'
}

export const Catalyst = {
  [Network.MAINNET]: '0x4a2f10076101650f40342885b99b6b101d83c486',
  [Network.RINKEBY]: '0x594709fed0d43fdf511e3ba055e4da14a8f6b53b'
}

export const BanName = {
  [Network.MAINNET]: '0x0c4c90a4f29872a2e9ef4c4be3d419792bca9a36',
  [Network.RINKEBY]: '0x8b8fc0e17c2900d669cc883e3b067e4135362402'
}

export const Tokens = {
  [Network.MAINNET]: '0xb43504e5381ec9941cead3d74377cb63cba3b901',
  [Network.RINKEBY]: '0xd871799aecc2a29443509ae8880a33f26924d804'
}

export const Finance = {
  [Network.MAINNET]: '0x08cde5fec827ecad8c2ef0ed5b895ab38409dd43',
  [Network.RINKEBY]: '0x7cd2df9217173528110e2c44eb18bd4cf0bbc601'
}

export const Agent = {
  [Network.MAINNET]: '0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce',
  [Network.RINKEBY]: '0x40a056bd2ec121b5966df0f3270a392d07e52629'
}

export const Delay = {
  [Network.MAINNET]: '0x4c0071d31cc9aecb8748c686b56cdb0a2cb08b21',
  [Network.RINKEBY]: '0x38daca8c123145ead833c42590f4e359fd6bfa0c'
}

export const HiddenApps = new Set([
  '0xfe5acb980e6893607df2a988f5cfbd4e4346b0cd',
  '0x80e55ee7f2e6b27ca2db9db0fe92642fc26212d1'
])

export const AppName = {
  Tokens: 'Tokens',
  Question: 'Question',
  SAB: 'SAB',
  COMMUNITY: 'Community',
  INBOX: 'INBOX',
  Delay: 'Delay',
  Catalyst: 'Catalyst',
  Finance: 'Finance',
  Agent: 'Agent',
  BanName: 'Deny name',
  POI: 'POI',
  System: 'System'
}

export const Time = {
  Millisecond: 1,
  Second: 1000,
  Minute: 1000 * 60,
  Hour: 1000 * 60 * 60,
  Day: 1000 * 60 * 60 * 24
}

export { App }
