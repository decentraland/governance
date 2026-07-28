import { ethers } from 'ethers'

import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { AlchemyBlock, AlchemyLog, AlchemyTransaction } from '../shared/types/events'

// Alchemy delegation-webhook fixtures, shared by the tests that exercise
// EventsService.delegationUpdate with the registry check off and on.

export const CLEAR_DELEGATE_SIGNATURE_HASH = '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064'
export const SET_DELEGATE_SIGNATURE_HASH = '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e'
export const SNAPSHOT_DELEGATION_REGISTRY = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'
export const UNRELATED_CONTRACT = '0x1111111111111111111111111111111111111111'
export const DELEGATOR = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
export const DELEGATE = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
export const TX_HASH = '0x00000000000000000000000000000000000000000000000000000000000000aa'
export const OTHER_TX_HASH = '0x00000000000000000000000000000000000000000000000000000000000000bb'
export const BLOCK_TIMESTAMP = 1700000000

// Derived from the configured space rather than hardcoded, so the topic matches whatever
// GATSBY_SNAPSHOT_SPACE resolves to (the empty string in CI).
export const SPACE_TOPIC = ethers.utils.formatBytes32String(SNAPSHOT_SPACE)
export const OTHER_SPACE_TOPIC = ethers.utils.formatBytes32String('another-space.eth')

// 32-byte topic holding a left-padded address, the way the registry emits indexed address args.
export function addressTopic(address: string): string {
  return '0x' + address.slice(2).toLowerCase().padStart(64, '0')
}

export function log(overrides: Partial<AlchemyLog> = {}): AlchemyLog {
  return {
    index: 0,
    data: '0x',
    topics: [SET_DELEGATE_SIGNATURE_HASH, addressTopic(DELEGATOR), SPACE_TOPIC, addressTopic(DELEGATE)],
    account: { address: SNAPSHOT_DELEGATION_REGISTRY },
    ...overrides,
  } as AlchemyLog
}

export function transaction(logs: AlchemyLog[], hash = TX_HASH): AlchemyTransaction {
  return { hash, nonce: 0, index: 0, from: { address: DELEGATOR }, logs }
}

export function block(transactions: AlchemyTransaction[]): AlchemyBlock {
  return { hash: '0xblock', number: 1, timestamp: BLOCK_TIMESTAMP, transactions }
}

export function blockWithLogs(logs: AlchemyLog[]): AlchemyBlock {
  return block([transaction(logs)])
}
