import { MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import { AccountType } from '../entities/User/types'

jest.mock('../entities/User/model', () => ({
  __esModule: true,
  default: { createDiscordConnection: jest.fn(), createForumConnection: jest.fn() },
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { UserService } = require('./user')

const ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'

function openWindows(): Record<string, { message_timeout: NodeJS.Timeout }> {
  return (UserService as unknown as { VALIDATIONS_IN_PROGRESS: Record<string, { message_timeout: NodeJS.Timeout }> })
    .VALIDATIONS_IN_PROGRESS
}

describe('the validation window', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    Object.keys(openWindows()).forEach((key) => {
      clearTimeout(openWindows()[key].message_timeout)
      delete openWindows()[key]
    })
    jest.useRealTimers()
  })

  describe('when it is left to expire', () => {
    beforeEach(() => {
      UserService.getValidationMessage(ADDRESS, AccountType.Discord)
      jest.advanceTimersByTime(MESSAGE_TIMEOUT_TIME)
    })

    it('should no longer be open', () => {
      expect(Object.keys(openWindows())).toHaveLength(0)
    })
  })

  // The timer from the first request used to survive and expire the second request's window.
  describe('when a second message is requested before the first window expires', () => {
    beforeEach(() => {
      UserService.getValidationMessage(ADDRESS, AccountType.Discord)
      jest.advanceTimersByTime(60 * 1000)
      UserService.getValidationMessage(ADDRESS, AccountType.Discord)
      jest.advanceTimersByTime(MESSAGE_TIMEOUT_TIME - 60 * 1000)
    })

    it('should keep the second window open for its own full duration', () => {
      expect(Object.keys(openWindows())).toHaveLength(1)
    })

    it('should close it once its own timeout elapses', () => {
      jest.advanceTimersByTime(60 * 1000)
      expect(Object.keys(openWindows())).toHaveLength(0)
    })
  })

  describe('when a window is opened for each account type', () => {
    beforeEach(() => {
      UserService.getValidationMessage(ADDRESS, AccountType.Discord)
      UserService.getValidationMessage(ADDRESS, AccountType.Forum)
    })

    it('should keep both rather than let one replace the other', () => {
      expect(Object.keys(openWindows())).toHaveLength(2)
    })
  })

  describe('when a discord validation is checked with no window open', () => {
    let thrown: Error

    beforeEach(async () => {
      thrown = (await UserService.checkDiscordValidationMessage(ADDRESS, []).catch((error: Error) => error)) as Error
    })

    it('should report the validation as timed out', () => {
      expect(thrown.message).toBe('Validation timed out')
    })
  })

  describe('when a forum validation is checked with no window open', () => {
    let thrown: Error

    beforeEach(async () => {
      thrown = (await UserService.checkForumValidationMessage(ADDRESS, []).catch((error: Error) => error)) as Error
    })

    it('should report the validation as timed out', () => {
      expect(thrown.message).toBe('Validation timed out')
    })
  })
})
