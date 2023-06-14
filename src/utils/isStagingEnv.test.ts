import { isHerokuEnv, isLocalEnv, isProdEnv, isStagingEnv } from './governanceEnvs'

jest.mock('../constants', () => ({
  GOVERNANCE_API: 'https://governance.decentraland.zone/api',
}))
describe('isStagingEnv', () => {
  it('returns true when env var is from staging', () => {
    expect(isStagingEnv()).toBe(true)
    expect(isProdEnv()).toBe(false)
    expect(isLocalEnv()).toBe(false)
    expect(isHerokuEnv()).toBe(false)
  })
})
