import { ethers } from 'ethers'
import fetch from 'isomorphic-fetch'

import { BLOCKNATIVE_API_KEY } from '../constants'
import { BlockNativeResponse, PolygonGasData } from '../entities/Badges/types'
import { ErrorService } from '../services/ErrorService'
import { ErrorCategory } from '../utils/errorCategories'

export class BlockNative {
  static async getPolygonGasData(): Promise<PolygonGasData> {
    try {
      const response = await fetch('https://api.blocknative.com/gasprices/blockprices?chainid=137', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: BLOCKNATIVE_API_KEY,
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
      return {
        maxFeePerGas: ethers.utils.parseUnits('33.3', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('40.19', 'gwei'),
      }
    }
  }
}
