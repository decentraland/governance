import { ChainId } from 'decentraland-gatsby/dist/utils/loader/manaBalance'

export type WalletAttributes = {
  id: string,
  address: string,
  name: string,
  network: ChainId,
  created_at: Date
}
