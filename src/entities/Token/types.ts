import { ChainId } from '@dcl/schemas'

export type TokenAttributes = {
  id: string,
  contract: string,
  network: ChainId,
  name: string,
  symbol: string,
  decimals: number,
  created_at: Date
}
