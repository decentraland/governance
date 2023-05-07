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

const getMessage = async () => Governance.get().getValidationMessage()
const THREAD_URL = `${DISCOURSE_API}/t/${GATSBY_DISCOURSE_CONNECT_THREAD}`
export default function useForumConnect() {
  const [user, userState] = useAuthContext()
  const [sign, signState] = useSign(user, userState.provider)
  const [copied, clipboardState] = useClipboardCopy(Time.Second)
  const [signResolveReject, setSignResolveReject] = useState<{
    resolve: (value: unknown) => void
    reject: (reason?: any) => void
  }>()
  const { startTimer, resetTimer, time } = useTimer(MESSAGE_TIMEOUT_TIME / 1000 - 2)

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
  }, [signResolveReject, signState])

  const getSignedMessage = useCallback(async () => {
    return new Promise((resolve, reject) => {
      getMessage()
        .then((message) => {
          if (message) {
            startTimer()
            signState.sign(message)
            setSignResolveReject({ resolve, reject })
          } else {
            reject(new Error('No message'))
          }
        })
        .catch(reject)
    })
  }, [signState])

  const copyMessageToClipboard = useCallback(() => {
    const { message, signature } = sign
    if (message && signature) {
      clipboardState.copy(`${message}\n\nSignature: ${signature}`)
    }
  }, [clipboardState, sign])

  const openThread = () => openUrl(THREAD_URL)

  return {
    getSignedMessage: getSignedMessage,
    copyMessageToClipboard: copyMessageToClipboard,
    openThread: openThread,
    time,
  }
}
