import React, { useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useSign from 'decentraland-gatsby/dist/hooks/useSign'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { hashMessage, recoverAddress } from 'ethers/lib/utils'

import { Governance } from '../clients/Governance'

const getMessage = (address: string, timestamp: string) => JSON.stringify({ address, timestamp })

export default function Identity() {
  const [getHash, setGetHash] = useState(false)
  const [validateProfile, setValidateProfile] = useState(false)
  const [user, userState] = useAuthContext()
  const [signature, signatureState] = useSign(user, userState.provider)

  const [message, hashState] = useAsyncMemo(
    async () => {
      if (getHash) {
        return await Governance.get().getValidationMessage()
      }
    },
    [getHash],
    { initialValue: undefined, callWithTruthyDeps: true }
  )

  useEffect(() => {
    if (message) {
      const { address, timestamp } = message
      signatureState.sign(getMessage(address, timestamp))
    }
  }, [message])

  useEffect(() => {
    console.log(signature)
    if (signature.signature && signature.message) {
      const recoveredAddress = recoverAddress(hashMessage(signature.message), signature.signature)

      console.log('recoveredAddress', recoveredAddress, user)
    }
  }, [signature])

  const [validation, validationState] = useAsyncMemo(
    async () => {
      if (validateProfile) {
        return await Governance.get().validateProfile()
      }
    },
    [validateProfile],
    { initialValue: undefined, callWithTruthyDeps: true }
  )

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <Button onClick={() => setGetHash(true)}>Get validation Hash</Button>
        {getHash && <div>Message: {JSON.stringify(message)}</div>}
        {signature.signature && <div>signature: {signature.signature}</div>}
      </div>
      <div>
        <Button onClick={() => setValidateProfile(true)}>Validate Profile</Button>
        {validation && <div>Validation: {JSON.stringify(validation)}</div>}
      </div>
    </div>
  )
}
