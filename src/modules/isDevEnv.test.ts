import { isDevApi } from './isDevEnv'

describe('isDevApi', () => {
  it('returns true for all dev api urls', () => {
    expect(isDevApi('https://localhost:8000/api')).toBe(true)
    expect(isDevApi('https://governance-pr.herokuapp.com')).toBe(true)
    expect(isDevApi('https://governance.decentraland.vote/api')).toBe(true)
    expect(isDevApi('https://governance.decentraland.zone/api')).toBe(true)
  })

  it('returns false for prod api url or an empty string', () => {
    expect(isDevApi('https://governance.decentraland.org/api')).toBe(false)
    expect(isDevApi('')).toBe(false)
  })
})
