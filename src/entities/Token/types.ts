import { ChainId } from '@dcl/schemas'

export type TokenAttributes = {
  id: string,
  contract: string,
  network: ChainId,
  name: string,
  symbol: string,
  created_at: Date
}
