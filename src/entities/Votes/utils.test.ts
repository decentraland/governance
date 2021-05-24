
import { calculateResult } from './utils'

const choices = ['yes', 'no']

const votes = {
  '0x8cff6832174091dae86f0244e3fd92d4ced2fe07': { choice: 1, vp: 56275 },
  '0x9982b469910c2ee2ea566dcfcc250cdd34056397': { choice: 1, vp: 400 },
  '0xd2d950cea649feef4d6111c18adbd9a37b3a9f63': { choice: 2, vp: 4269 },
  '0xd210dc1dd26751503cbf1b8c9154224707820da8': { choice: 1, vp: 1282 },
  '0xe2b6024873d218b2e83b462d3658d8d7c3f55a18': { choice: 1, vp: 121889 },
  '0xec6e6c0841a2ba474e92bf42baf76bfe80e8657c': { choice: 1, vp: 12000 },
}

describe('entities/Votes/utils', () => {
  test('calculateResult', () => {
    console.log(calculateResult(choices, votes))
  })
})