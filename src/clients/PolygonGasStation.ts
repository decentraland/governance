import { ethers } from 'ethers'
import fetch from 'isomorphic-fetch'

import { PolygonGasData } from '../entities/Badges/types'
import { ErrorService } from '../services/ErrorService'
import { PolygonGasStationResponse } from '../types/PolygonGasStation'
import { ErrorCategory } from '../utils/errorCategories'

const POLYGON_GAS_STATION_URL = 'https://gasstation.polygon.technology/v2'

// Gwei has 9 decimals; the gas station returns floats that can exceed that precision,
// so we truncate to 9 places before parsing to avoid ethers' "fractional component exceeds decimals" error.
function parseGwei(value: number): ethers.BigNumber {
  return ethers.utils.parseUnits(value.toFixed(9), 'gwei')
}

export class PolygonGasStation {
  static async getPolygonGasData(): Promise<PolygonGasData> {
    try {
      const response = await fetch(POLYGON_GAS_STATION_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      const data: PolygonGasStationResponse = await response.json()

      const { maxFee, maxPriorityFee } = data.standard

      return {
        maxFeePerGas: parseGwei(maxFee),
        maxPriorityFeePerGas: parseGwei(maxPriorityFee),
      }
    } catch (error) {
      ErrorService.report('Error while fetching polygon gas prices', { error, category: ErrorCategory.Badges })
      throw error
    }
  }
}
