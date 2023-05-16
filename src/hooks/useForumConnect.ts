import { useCallback, useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'
import useClipboardCopy from 'decentraland-gatsby/dist/hooks/useClipboardCopy'
import useSign from 'decentraland-gatsby/dist/hooks/useSign'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Governance } from '../clients/Governance'
import { SegmentEvent } from '../entities/Events/types'
import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import { DISCOURSE_API } from '../entities/User/utils'
import { openUrl } from '../helpers'

import useTimer from './useTimer'

export const THREAD_URL = `${DISCOURSE_API}${
  DISCOURSE_API.endsWith('/') ? '' : '/'
}t/${GATSBY_DISCOURSE_CONNECT_THREAD}/10000`
const VALIDATION_CHECK_INTERVAL = 5 * 1000 // 5 seconds

const getMessage = async () => Governance.get().getValidationMessage()
export default function useForumConnect() {
  const [user, userState] = useAuthContext()
  const track = useTrackContext()
  const [sign, signState] = useSign(user, userState.provider)
  const [copied, clipboardState] = useClipboardCopy(Time.Second)
  const [signatureResolution, setSignatureResolution] = useState<{
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
  }>()
  const { startTimer, resetTimer, time } = useTimer(MESSAGE_TIMEOUT_TIME / 1000 - 1)
  const [validatingProfile, setValidatingProfile] = useState<NodeJS.Timer>()
  const [isValidated, setIsValidated] = useState<boolean>()

  useEffect(() => {
    if (signatureResolution) {
      if (!signState.signing) {
        if (!signState.error) {
          signatureResolution.resolve(undefined)
        } else {
          resetTimer()
          signatureResolution.reject(signState.error)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureResolution, signState])

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
            setSignatureResolution({ resolve, reject })
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
      clipboardState.copy(`${message}\nSignature: ${signature}`)
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
            track(SegmentEvent.IdentityCompleted, { address: user, account: 'forum' })
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
    getSignedMessage,
    copyMessageToClipboard,
    openThread,
    time,
    isValidated,
    reset,
  }
}
