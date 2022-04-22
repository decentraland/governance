import { Wallet } from '@ethersproject/wallet';
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env';

const SNAPSHOT_PRIVATE_KEY = requiredEnv('SNAPSHOT_PRIVATE_KEY')
export const SNAPSHOT_ACCOUNT = new Wallet(SNAPSHOT_PRIVATE_KEY)

export async function signMessage(wallet: Wallet, msg: string) {
  return wallet.signMessage(Buffer.from(msg, 'utf8'));
}
