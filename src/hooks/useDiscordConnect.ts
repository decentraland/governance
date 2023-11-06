import { useCallback } from 'react'

import { Governance } from '../clients/Governance'
import { SegmentEvent } from '../entities/Events/types'
import { GATSBY_DISCORD_PROFILE_VERIFICATION_URL } from '../entities/User/constants'
import { AccountType } from '../entities/User/types'
import { openUrl } from '../helpers'

import useValidationSetup, { VALIDATION_CHECK_INTERVAL } from './useValidationSetup'

function useDiscordConnect() {
  const {
    user,
    track,
    resetTimer,
    getSignedMessage,
    copyMessageToClipboard,
    time,
    validatingProfile,
    setValidatingProfile,
    isValidated,
    setIsValidated,
    resetValidation,
  } = useValidationSetup(AccountType.Discord)

  const openChannel = useCallback(() => {
    openUrl(GATSBY_DISCORD_PROFILE_VERIFICATION_URL)
    if (validatingProfile === undefined) {
      const validationChecker = setInterval(async () => {
        try {
          const { valid } = await Governance.get().validateDiscordProfile()
          if (valid) {
            clearInterval(validationChecker)
            resetTimer()
            setIsValidated(true)
            track(SegmentEvent.IdentityCompleted, { address: user, account: AccountType.Discord })
          }
        } catch (error) {
          clearInterval(validationChecker)
          setIsValidated(false)
        }
      }, VALIDATION_CHECK_INTERVAL)
      setValidatingProfile(validationChecker)
    }
  }, [resetTimer, setIsValidated, setValidatingProfile, track, user, validatingProfile])

  return {
    getSignedMessage,
    copyMessageToClipboard,
    openChannel,
    time,
    isValidated,
    reset: resetValidation,
  }
}

export default useDiscordConnect
