const login = jest.fn()
const on = jest.fn()

jest.mock('discord.js', () => {
  const actual = jest.requireActual('discord.js')
  return {
    ...actual,
    Client: jest.fn().mockImplementation(() => ({ on, login })),
  }
})

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
}))

// Both read into module constants at import time.
process.env.DISCORD_TOKEN = 'test-token'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DiscordService } = require('./discord')

describe('DiscordService.init', () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Nothing in the process handles unhandled rejections, so an uncaught login failure would
  // terminate the whole server rather than leaving discord disabled.
  describe('when logging in fails', () => {
    let loginError: Error

    beforeEach(async () => {
      loginError = new Error('An invalid token was provided')
      login.mockRejectedValueOnce(loginError)
      DiscordService.init()
      // Let the rejection settle; an unhandled one would surface here rather than at exit.
      await new Promise((resolve) => setImmediate(resolve))
    })

    it('should report the failure instead of leaving the rejection unhandled', () => {
      expect(consoleError).toHaveBeenCalledWith('Discord client login failed', loginError)
    })
  })

  describe('when the client is constructed', () => {
    beforeEach(() => {
      login.mockResolvedValueOnce(undefined)
      DiscordService.init()
    })

    it('should listen for the error event the client actually emits', () => {
      expect(on).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('should report what that listener receives', () => {
      const clientError = new Error('gateway exploded')
      const listener = on.mock.calls.find(([event]) => event === 'error')?.[1]
      listener(clientError)
      expect(consoleError).toHaveBeenCalledWith('Error in Discord client', clientError)
    })
  })
})
