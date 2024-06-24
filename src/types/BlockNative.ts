type BlockNativeEstimation = {
  confidence: number
  price: number
  maxPriorityFeePerGas: number
  maxFeePerGas: number
}

export type BlockNativeResponse = {
  system: string
  network: string
  unit: string
  maxPrice: number
  currentBlockNumber: number
  msSinceLastBlock: number
  blockPrices: [
    {
      blockNumber: number
      estimatedTransactionCount: number
      baseFeePerGas: number
      estimatedPrices: BlockNativeEstimation[]
    }
  ]
  estimatedBaseFees: never[]
}
