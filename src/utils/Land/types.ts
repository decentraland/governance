export type Tile = {
  id: string
  x: number
  y: number
  type: 'owned' | 'unowned' | 'plaza' | 'road' | 'district'
  top: boolean
  left: boolean
  topLeft: boolean
  updatedAt: number
  name?: string
  owner?: string
  estateId?: string
  tokenId?: string
  price?: number
}
