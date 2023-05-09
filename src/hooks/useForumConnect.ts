import { useCallback, useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useSign from 'decentraland-gatsby/dist/hooks/useSign'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Governance } from '../clients/Governance'
import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from '../entities/Discourse/constants'
import { DISCOURSE_API } from '../entities/Discourse/utils'
import { openUrl } from '../helpers'

import useTimer from './useTimer'

export const THREAD_URL = `${DISCOURSE_API}${
  DISCOURSE_API.endsWith('/') ? '' : '/'
}t/${GATSBY_DISCOURSE_CONNECT_THREAD}`
const VALIDATION_CHECK_INTERVAL = 5 * 1000 // 5 seconds

const getMessage = async () => Governance.get().getValidationMessage()
export default function useForumConnect() {
  const [user, userState] = useAuthContext()
  const [sign, signState] = useSign(user, userState.provider)
  const [copied, clipboardState] = useClipboardCopy(Time.Second)
  const [signResolveReject, setSignResolveReject] = useState<{
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
  }>()
  const { startTimer, resetTimer, time } = useTimer(MESSAGE_TIMEOUT_TIME / 1000 - 1)
  const [validatingProfile, setValidatingProfile] = useState<NodeJS.Timer>()
  const [isValidated, setIsValidated] = useState<boolean>()

  useEffect(() => {
    if (signResolveReject) {
      if (!signState.signing) {
        if (!signState.error) {
          signResolveReject.resolve(undefined)
        } else {
          resetTimer()
          signResolveReject.reject(signState.error)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signResolveReject, signState])

  useEffect(() => {
    if (time <= 0) {
      if (validatingProfile) {
        clearInterval(validatingProfile)
        setValidatingProfile(undefined)
      }
      console.error('Validation Time Expired')
    }
  }, [time, validatingProfile])

  useEffect(() => {
    if (isValidated !== undefined) {
      resetTimer()
    }
  }, [isValidated, resetTimer])

  const getSignedMessage = useCallback(async () => {
    return new Promise((resolve, reject) => {
      getMessage()
        .then((message) => {
          if (message) {
            startTimer()
            setIsValidated(undefined)
            signState.sign(message)
            setSignResolveReject({ resolve, reject })
          } else {
            reject(new Error('No message'))
          }
        })
        .catch(reject)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signState])

  const copyMessageToClipboard = useCallback(() => {
    const { message, signature } = sign
    if (message && signature) {
      clipboardState.copy(`${message}\n\nSignature: ${signature}`)
    }
  }, [clipboardState, sign])

  const openThread = () => {
    openUrl(THREAD_URL)
    if (validatingProfile === undefined) {
      const validationChecker = setInterval(async () => {
        try {
          const { valid } = await Governance.get().validateProfile()
          if (valid) {
            clearInterval(validationChecker)
            resetTimer()
            setIsValidated(true)
          }
        } catch (error) {
          console.error(error)
          clearInterval(validationChecker)
          setIsValidated(false)
        }
      }, VALIDATION_CHECK_INTERVAL)
      setValidatingProfile(validationChecker)
    }
  }

  const reset = useCallback(() => {
    if (validatingProfile) {
      clearInterval(validatingProfile)
      setValidatingProfile(undefined)
    }
    setIsValidated(undefined)
    resetTimer()
  }, [resetTimer, validatingProfile])

  return {
    getSignedMessage: getSignedMessage,
    copyMessageToClipboard: copyMessageToClipboard,
    openThread: openThread,
    time,
    isValidated,
    reset,
  }
}
