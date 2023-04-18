import { isHerokuEnv, isLocalEnv, isProdEnv, isStagingEnv } from './governanceEnvs'

jest.mock('../constants', () => ({
  GOVERNANCE_API: 'https://governance.decentraland.org/api',
}))
describe('isProdEnv', () => {
  it('returns true when env var is from prod', () => {
    expect(isProdEnv()).toBe(true)
    expect(isLocalEnv()).toBe(false)
    expect(isHerokuEnv()).toBe(false)
    expect(isStagingEnv()).toBe(false)
  })
})
