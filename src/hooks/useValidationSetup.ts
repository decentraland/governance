import { useCallback, useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'

import { MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import Time from '../utils/date/Time'

import useClipboardCopy from './useClipboardCopy'
import useTimer from './useTimer'

function useValidationSetup() {
  const [user, userState] = useAuthContext()
  const track = useTrackContext()

  const [clipboardMessage, setClipboardMessage] = useState('')
  const { handleCopy } = useClipboardCopy(Time.Second)
  const { startTimer, resetTimer, time } = useTimer(MESSAGE_TIMEOUT_TIME / 1000 - 1)
  const [validatingProfile, setValidatingProfile] = useState<NodeJS.Timer>()
  const [isValidated, setIsValidated] = useState<boolean>()

  useEffect(() => {
    if (time <= 0 && validatingProfile) {
      clearInterval(validatingProfile)
      setValidatingProfile(undefined)
    }
  }, [time, validatingProfile])

  useEffect(() => {
    if (isValidated !== undefined) {
      resetTimer()
    }
  }, [isValidated, resetTimer])

  const resetValidation = useCallback(() => {
    if (validatingProfile) {
      clearInterval(validatingProfile)
      setValidatingProfile(undefined)
    }
    setIsValidated(undefined)
    resetTimer()
  }, [resetTimer, validatingProfile])

  return {
    user,
    userState,
    track,
    clipboardMessage,
    setClipboardMessage,
    handleCopy,
    startTimer,
    resetTimer,
    time,
    validatingProfile,
    setValidatingProfile,
    isValidated,
    setIsValidated,
    resetValidation,
  }
}

export default useValidationSetup
