import { useCallback } from 'react'

import { Web3Provider } from '@ethersproject/providers'

import { Governance } from '../clients/Governance'
import { AccountType } from '../components/Modal/IdentityConnectModal/AccountsConnectModal'
import { SegmentEvent } from '../entities/Events/types'
import { GATSBY_DISCOURSE_CONNECT_THREAD } from '../entities/User/constants'
import { Account } from '../entities/User/types'
import { DISCOURSE_API } from '../entities/User/utils'
import { openUrl } from '../helpers'

import useValidationSetup from './useValidationSetup'

export const THREAD_URL = `${DISCOURSE_API}${
  DISCOURSE_API.endsWith('/') ? '' : '/'
}t/${GATSBY_DISCOURSE_CONNECT_THREAD}/10000`
const VALIDATION_CHECK_INTERVAL = 10 * 1000 // 10 seconds

const getMessage = async () => Governance.get().getValidationMessage(Account.Forum)

export default function useForumConnect() {
  const {
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
  } = useValidationSetup()

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
      resetTimer()
      throw new Error('Failed to sign message')
    }

    setClipboardMessage(`${message}\nSignature: ${signedMessage}`)
    return signedMessage
  }, [userState.provider, startTimer, setIsValidated, setClipboardMessage, resetTimer])

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
  }

  return {
    getSignedMessage,
    copyMessageToClipboard,
    openThread,
    time,
    isValidated,
    reset: resetValidation,
  }
}
