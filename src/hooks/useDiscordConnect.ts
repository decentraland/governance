import { useCallback } from 'react'

import { Web3Provider } from '@ethersproject/providers'

import { Governance } from '../clients/Governance'
import { SegmentEvent } from '../entities/Events/types'
import { GATSBY_DISCORD_PROFILE_VERIFICATION_URL } from '../entities/User/constants'
import { Account, AccountType } from '../entities/User/types'
import { openUrl } from '../helpers'

import useValidationSetup from './useValidationSetup'

const getMessage = async () => Governance.get().getValidationMessage(Account.Discord)
const VALIDATION_CHECK_INTERVAL = 10 * 1000 // 10 seconds

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
  }, [resetTimer, setClipboardMessage, setIsValidated, startTimer, userState.provider])

  const copyMessageToClipboard = useCallback(() => {
    if (clipboardMessage) {
      handleCopy(clipboardMessage)
    }
  }, [clipboardMessage, handleCopy])

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
