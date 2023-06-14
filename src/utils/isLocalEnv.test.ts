import { isHerokuEnv, isLocalEnv, isProdEnv, isStagingEnv } from './governanceEnvs'

jest.mock('../constants', () => ({
  GOVERNANCE_API: 'https://localhost:8080/api',
}))
describe('isLocalEnv', () => {
  it('returns true when the url is localhost', () => {
    expect(isLocalEnv()).toBe(true)
    expect(isProdEnv()).toBe(false)
    expect(isHerokuEnv()).toBe(false)
    expect(isStagingEnv()).toBe(false)
  })
})
