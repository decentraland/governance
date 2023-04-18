import { isProdApi } from './governanceEnvs'

describe('isProdApi', () => {
  it('returns false for all dev api urls', () => {
    expect(isProdApi('https://localhost:8000/api')).toBe(false)
    expect(isProdApi('https://governance-pr.herokuapp.com')).toBe(false)
    expect(isProdApi('https://governance.decentraland.vote/api')).toBe(false)
    expect(isProdApi('https://governance.decentraland.zone/api')).toBe(false)
  })

  it('returns true for prod api url or an empty string', () => {
    expect(isProdApi('https://governance.decentraland.org/api')).toBe(true)
    expect(isProdApi('')).toBe(true)
  })
})
