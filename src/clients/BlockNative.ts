import { ethers } from 'ethers'
import fetch from 'isomorphic-fetch'

import { PolygonGasData } from '../entities/Badges/types'
import { ErrorService } from '../services/ErrorService'
import { BlockNativeResponse } from '../types/BlockNative'
import { ErrorCategory } from '../utils/errorCategories'

export class BlockNative {
  static async getPolygonGasData(): Promise<PolygonGasData> {
    try {
      const response = await fetch('https://api.blocknative.com/gasprices/blockprices?chainid=137', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: require('../../constants').BLOCKNATIVE_API_KEY,
        },
      })
      const data: BlockNativeResponse = await response.json()

      const blockPrice = data.blockPrices[0] // current block
      const estimatedPrice = blockPrice.estimatedPrices[0] // highest confidence estimation

      return {
        maxFeePerGas: ethers.utils.parseUnits(estimatedPrice.maxFeePerGas.toString(), 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits(estimatedPrice.maxPriorityFeePerGas.toString(), 'gwei'),
      }
    } catch (error) {
      ErrorService.report('Error while fetching polygon gas prices', { error, category: ErrorCategory.Badges })
      throw error
    }
  }
}
