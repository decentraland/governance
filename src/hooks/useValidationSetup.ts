import { useCallback, useEffect, useState } from 'react'

import { Web3Provider } from '@ethersproject/providers'

import { Governance } from '../clients/Governance'
import { MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import { AccountType } from '../entities/User/types'
import { useAuthContext } from '../front/context/AuthProvider'
import Time from '../utils/date/Time'

import useClipboardCopy from './useClipboardCopy'
import useTimer from './useTimer'

export const VALIDATION_CHECK_INTERVAL = 10 * 1000 // 10 seconds

function useValidationSetup(account?: AccountType) {
  const [user, userState] = useAuthContext()

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

  const getSignedMessage = useCallback(async () => {
    if (!userState.provider) {
      return
    }

    const message = await Governance.get().getValidationMessage(account)
    if (!message) {
      throw new Error('No message')
    }

    const signer = new Web3Provider(userState.provider).getSigner()
    startTimer()
    setIsValidated(undefined)
    const signedMessage = await signer.signMessage(message)
    if (!signedMessage) {
      resetTimer()
      throw new Error('Failed to sign message')
    }

    setClipboardMessage(`${message}\nSignature: ${signedMessage}`)
    return signedMessage
  }, [account, resetTimer, startTimer, userState.provider])

  const copyMessageToClipboard = useCallback(() => {
    if (clipboardMessage) {
      handleCopy(clipboardMessage)
    }
  }, [clipboardMessage, handleCopy])

  return {
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
  }
}

export default useValidationSetup
