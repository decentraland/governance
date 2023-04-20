import React, { useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../clients/Governance'

export default function Identity() {
  const [getHash, setGetHash] = useState(false)
  const [validateProfile, setValidateProfile] = useState(false)

  const [hash, hashState] = useAsyncMemo(
    async () => {
      if (getHash) {
        const { hash } = await Governance.get().getValidationHash()
        return hash
      }
    },
    [getHash],
    { initialValue: undefined, callWithTruthyDeps: true }
  )

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
        {getHash && <div>Hash: {hash}</div>}
      </div>
      <div>
        <Button onClick={() => setValidateProfile(true)}>Validate Profile</Button>
        {validation && <div>Validation: {JSON.stringify(validation)}</div>}
      </div>
    </div>
  )
}
