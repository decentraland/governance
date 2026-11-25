import { getVestingContractUrl } from '../../constants'

import { normalizeVestingAddress } from './vesting'

describe('normalizeVestingAddress', () => {
  it('should lowercase an address with an uppercase 0X prefix, rather than prefix it again', () => {
    expect(normalizeVestingAddress('0X4240C3EEA13548418AEA8EFC52E4C2E1B2D42F84')).toBe(
      '0x4240c3eea13548418aea8efc52e4c2e1b2d42f84'
    )
  })

  it('should lowercase a checksummed address', () => {
    expect(normalizeVestingAddress('0x3dA67699E5938bE3336fe0619B07E05CB1CDEEf7')).toBe(
      '0x3da67699e5938be3336fe0619b07e05cb1cdeef7'
    )
  })

  it('should add the prefix when it is missing', () => {
    expect(normalizeVestingAddress('3da67699e5938be3336fe0619b07e05cb1cdeef7')).toBe(
      '0x3da67699e5938be3336fe0619b07e05cb1cdeef7'
    )
  })

  it('should drop surrounding whitespace', () => {
    expect(normalizeVestingAddress(' 0x3da67699e5938be3336fe0619b07e05cb1cdeef7\n')).toBe(
      '0x3da67699e5938be3336fe0619b07e05cb1cdeef7'
    )
  })
})

describe('getVestingContractUrl', () => {
  it('should link to the normalized address', () => {
    expect(getVestingContractUrl('4240C3EEA13548418AEA8EFC52E4C2E1B2D42F84')).toMatch(
      /0x4240c3eea13548418aea8efc52e4c2e1b2d42f84$/
    )
  })
})
