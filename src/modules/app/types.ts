import { App } from '@aragon/connect'
import { Network } from 'modules/wallet/types'

export const VOTING_GRAPH = {
  [Network.MAINNET]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-mainnet',
  [Network.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby',
  // [Network.MAINNET]: 'https://graph.backend.aragon.org/subgraphs/name/aragon/aragon-mainnet',
  // [Network.RINKEBY]: 'https://graph.backend.aragon.org/subgraphs/name/aragon/aragon-rinkeby'
}

export const VOTING_APP = {
  [Network.MAINNET]: 'voting.aragonpm.eth',
  [Network.RINKEBY]: 'voting.aragonpm.eth'
}

export const Delay = {
  Millisecond: 1,
  Second: 1000,
  Minute: 1000 * 60,
  Hour: 1000 * 60 * 60,
  Day: 1000 * 60 * 60 * 24
}

export const AppName = {
  Tokens: 'tokens',
  Voting: 'voting',
  SAB: 'sab',
  INBOX: 'inbox',
  COMMUNITY: 'community',
  Delay: 'delay',
  Catalyst: 'catalyst',
  Finance: 'finance',
  Agent: 'agent',
  DenyName: 'deny name',
  POI: 'poi'
}

export const APP_DELAY = {
  "DEFAULT": Delay.Day * 7,
  "0xbc1863a593aaebb40b4f43665de30174c9d3fe29": Delay.Day,
  "0x41e83d829459f99bf4ee2e26d0d79748fb16b94f": Delay.Day,
  "0x4c0071d31cc9aecb8748c686b56cdb0a2cb08b21": Delay.Day,
  "0x38daca8c123145ead833c42590f4e359fd6bfa0c": Delay.Day
}

export const CREATOR_NAME = {
  "0xd871799aecc2a29443509ae8880a33f26924d804": AppName.Tokens,
  "0xb43504e5381ec9941cead3d74377cb63cba3b901": AppName.Tokens,
  "0xbc1863a593aaebb40b4f43665de30174c9d3fe29": AppName.Voting,
  "0x41e83d829459f99bf4ee2e26d0d79748fb16b94f": AppName.Voting,
  "0x5616500b003475136ee6b0844896a2e1ccc68140": AppName.Voting,
  "0x2aa9074caa11e30838caf681d34b981ffd025a8b": AppName.Voting,
  "0x37187b0f2089b028482809308e776f92eeb7334e": AppName.Voting,
  "0x0741ab50b28ed40ed81acc1867cf4d57004c29b6": AppName.Voting,
  "0x4c0071d31cc9aecb8748c686b56cdb0a2cb08b21": AppName.Delay,
  "0x38daca8c123145ead833c42590f4e359fd6bfa0c": AppName.Delay,
  "0x4a2f10076101650f40342885b99b6b101d83c486": AppName.Catalyst,
  "0x594709fed0d43fdf511e3ba055e4da14a8f6b53b": AppName.Catalyst,
  "0x7cd2df9217173528110e2c44eb18bd4cf0bbc601": AppName.Finance,
  "0x08cde5fec827ecad8c2ef0ed5b895ab38409dd43": AppName.Finance,
  "0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce": AppName.Agent,
  "0x40a056bd2ec121b5966df0f3270a392d07e52629": AppName.Agent,
  "0x8b8fc0e17c2900d669cc883e3b067e4135362402": AppName.DenyName,
  "0x0c4c90a4f29872a2e9ef4c4be3d419792bca9a36": AppName.DenyName,
  "0x0ef15a1c7a49429a36cb46d4da8c53119242b54e": AppName.POI,
  "0xde839e6cee47d9e24ac12e9215b7a45112923141": AppName.POI
}

export const APP_NAME = {
  "0xd871799aecc2a29443509ae8880a33f26924d804": AppName.Tokens,
  "0xb43504e5381ec9941cead3d74377cb63cba3b901": AppName.Tokens,
  "0xbc1863a593aaebb40b4f43665de30174c9d3fe29": AppName.SAB,
  "0x41e83d829459f99bf4ee2e26d0d79748fb16b94f": AppName.SAB,
  "0x5616500b003475136ee6b0844896a2e1ccc68140": AppName.COMMUNITY,
  "0x2aa9074caa11e30838caf681d34b981ffd025a8b": AppName.COMMUNITY,
  "0x37187b0f2089b028482809308e776f92eeb7334e": AppName.INBOX,
  "0x0741ab50b28ed40ed81acc1867cf4d57004c29b6": AppName.INBOX,
  "0x4c0071d31cc9aecb8748c686b56cdb0a2cb08b21": AppName.Delay,
  "0x38daca8c123145ead833c42590f4e359fd6bfa0c": AppName.Delay,
  "0x4a2f10076101650f40342885b99b6b101d83c486": AppName.Catalyst,
  "0x594709fed0d43fdf511e3ba055e4da14a8f6b53b": AppName.Catalyst,
  "0x7cd2df9217173528110e2c44eb18bd4cf0bbc601": AppName.Finance,
  "0x08cde5fec827ecad8c2ef0ed5b895ab38409dd43": AppName.Finance,
  "0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce": AppName.Agent,
  "0x40a056bd2ec121b5966df0f3270a392d07e52629": AppName.Agent,
  "0x8b8fc0e17c2900d669cc883e3b067e4135362402": AppName.DenyName,
  "0x0c4c90a4f29872a2e9ef4c4be3d419792bca9a36": AppName.DenyName,
  "0x0ef15a1c7a49429a36cb46d4da8c53119242b54e": AppName.POI,
  "0xde839e6cee47d9e24ac12e9215b7a45112923141": AppName.POI
}

export { App }
