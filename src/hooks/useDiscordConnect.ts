import { useCallback, useEffect } from 'react'

import { Web3Provider } from '@ethersproject/providers'

import { Governance } from '../clients/Governance'
import { Account } from '../entities/User/types'

import useValidationSetup from './useValidationSetup'

const getMessage = async () => Governance.get().getValidationMessage(Account.Discord)

function useDiscordConnect() {
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
  }, [resetTimer, setClipboardMessage, setIsValidated, startTimer, userState.provider])

  const copyMessageToClipboard = useCallback(() => {
    if (clipboardMessage) {
      handleCopy(clipboardMessage)
    }
  }, [clipboardMessage, handleCopy])

  const validate = useCallback(async () => {
    try {
      await Governance.get().validateDiscordProfile()
    } catch (error) {
      console.error(error)
    }
  }, [])

  return {
    getSignedMessage,
    copyMessageToClipboard,
    validate,
  }
}

export default useDiscordConnect
