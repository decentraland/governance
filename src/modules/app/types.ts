import { App } from '@aragon/connect'
import { Network } from 'modules/wallet/types'

export const VOTING_GRAPH = {
  [Network.MAINNET]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-mainnet',
  [Network.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-voting-rinkeby'
}

export const VOTING_APP = {
  [Network.MAINNET]: 'voting.aragonpm.eth',
  [Network.RINKEBY]: 'voting.aragonpm.eth'
}

export const APP_DELAY = {
  "DEFAULT": 1000 * 60 * 60 * 24 * 7,
  "0xbc1863a593aaebb40b4f43665de30174c9d3fe29": 1000 * 60 * 60 * 24 * 1,
  "0x41e83d829459f99bf4ee2e26d0d79748fb16b94f": 1000 * 60 * 60 * 24 * 1,
  "0x4c0071d31cc9aecb8748c686b56cdb0a2cb08b21": 1000 * 60 * 60 * 24 * 1,
  "0x38daca8c123145ead833c42590f4e359fd6bfa0c": 1000 * 60 * 60 * 24 * 1
}

export const APP_NAME = {
  "0xbc1863a593aaebb40b4f43665de30174c9d3fe29": "SAB",
  "0x41e83d829459f99bf4ee2e26d0d79748fb16b94f": "SAB",
  "0x5616500b003475136ee6b0844896a2e1ccc68140": "COMMUNITY",
  "0x2aa9074caa11e30838caf681d34b981ffd025a8b": "COMMUNITY",
  "0x37187b0f2089b028482809308e776f92eeb7334e": "INBOX",
  "0x0741ab50b28ed40ed81acc1867cf4d57004c29b6": "INBOX",
  "0x4c0071d31cc9aecb8748c686b56cdb0a2cb08b21": "DELAY",
  "0x38daca8c123145ead833c42590f4e359fd6bfa0c": "DELAY",
  "0x4a2f10076101650f40342885b99b6b101d83c486": "CATALYST",
  "0x594709fed0d43fdf511e3ba055e4da14a8f6b53b": "CATALYST",
  "0x8b8fc0e17c2900d669cc883e3b067e4135362402": "DENY NAME",
  "0x0c4c90a4f29872a2e9ef4c4be3d419792bca9a36": "DENY NAME",
  "0x0ef15a1c7a49429a36cb46d4da8c53119242b54e": "POI",
  "0xde839e6cee47d9e24ac12e9215b7a45112923141": "POI"
}

export { App }
