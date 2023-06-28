import { useCallback, useEffect, useState } from 'react'

import { Web3Provider } from '@ethersproject/providers'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'

import { Governance } from '../clients/Governance'
import { AccountType } from '../components/Modal/IdentityConnectModal/AccountsConnectModal'
import { SegmentEvent } from '../entities/Events/types'
import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import { DISCOURSE_API } from '../entities/User/utils'
import { openUrl } from '../helpers'
import Time from '../utils/date/Time'

import useClipboardCopy from './useClipboardCopy'
import useTimer from './useTimer'

export const THREAD_URL = `${DISCOURSE_API}${
  DISCOURSE_API.endsWith('/') ? '' : '/'
}t/${GATSBY_DISCOURSE_CONNECT_THREAD}/10000`
const VALIDATION_CHECK_INTERVAL = 10 * 1000 // 10 seconds

const getMessage = async () => Governance.get().getValidationMessage()

export default function useForumConnect() {
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

  const getSignedMessage = useCallback(async () => {
    if (!userState.provider) {
      return
    }

    const message = await getMessage()
    if (!message) {
      throw new Error('No message')
    }

    const signer = new Web3Provider(userState.provider).getSigner()
    startTimer()
    setIsValidated(undefined)
    const signedMessage = await signer.signMessage(message)
    if (!signedMessage) {
      throw new Error('Failed to sign message')
    }

    setClipboardMessage(`${message}\nSignature: ${signedMessage}`)
    return signedMessage
  }, [startTimer, userState.provider])

  const copyMessageToClipboard = useCallback(() => {
    if (clipboardMessage) {
      handleCopy(clipboardMessage)
    }
  }, [clipboardMessage, handleCopy])

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
            track(SegmentEvent.IdentityCompleted, { address: user, account: AccountType.Forum })
          }
        } catch (error) {
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
