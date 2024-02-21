import { useCallback } from 'react'

import { Governance } from '../clients/Governance'
import { SegmentEvent } from '../entities/Events/types'
import { GATSBY_DISCOURSE_CONNECT_THREAD } from '../entities/User/constants'
import { AccountType } from '../entities/User/types'
import { DISCOURSE_API } from '../entities/User/utils'
import { openUrl } from '../helpers'

import useAnalyticsTrack from './useAnalyticsTrack'
import useValidationSetup, { VALIDATION_CHECK_INTERVAL } from './useValidationSetup'

export const THREAD_URL = `${DISCOURSE_API}${
  DISCOURSE_API.endsWith('/') ? '' : '/'
}t/${GATSBY_DISCOURSE_CONNECT_THREAD}/10000`

export default function useForumConnect() {
  const {
    user,
    getSignedMessage,
    copyMessageToClipboard,
    resetTimer,
    time,
    validatingProfile,
    setValidatingProfile,
    isValidated,
    setIsValidated,
    resetValidation,
  } = useValidationSetup(AccountType.Forum)

  const track = useAnalyticsTrack()

  const openThread = useCallback(() => {
    openUrl(THREAD_URL)
    if (validatingProfile === undefined) {
      const validationChecker = setInterval(async () => {
        try {
          const { valid } = await Governance.get().validateForumProfile()
          if (valid) {
            clearInterval(validationChecker)
            resetTimer()
            setIsValidated(true)
            track(SegmentEvent.IdentityCompleted, { address: user, account: AccountType.Forum })
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
    openThread,
    time,
    isValidated,
    reset: resetValidation,
  }
}
