import { isHerokuEnv, isLocalEnv, isProdEnv, isStagingEnv } from './governanceEnvs'

jest.mock('../constants', () => ({
  GOVERNANCE_API: 'https://governance-pr.herokuapp.com/api',
}))
describe('isHerokuEnv', () => {
  it('returns true when env var is from heroku', () => {
    expect(isHerokuEnv()).toBe(true)
    expect(isProdEnv()).toBe(false)
    expect(isLocalEnv()).toBe(false)
    expect(isStagingEnv()).toBe(false)
  })
})
