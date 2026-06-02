type PolygonGasStationTier = {
  maxPriorityFee: number
  maxFee: number
}

export type PolygonGasStationResponse = {
  safeLow: PolygonGasStationTier
  standard: PolygonGasStationTier
  fast: PolygonGasStationTier
  estimatedBaseFee: number
  blockTime: number
  blockNumber: number
}
