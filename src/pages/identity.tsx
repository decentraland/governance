import React, { useEffect, useMemo, useState } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../clients/Governance'
import { openUrl } from '../helpers'

const LOCAL_STORAGE_KEY = 'org.decentraland.governance.discourse.encryption_key'

function setPrivateKey(key: string) {
  localStorage.setItem(LOCAL_STORAGE_KEY, key)
}

export default function Identity() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const payload = params.get('payload')
  const [hasPayload, setHasPayload] = useState(false)
  const [key, keyState] = useAsyncMemo(
    async () => {
      if (payload) {
        const { privateKey } = await Governance.get().setDiscourseConnectToken(payload)
        return privateKey
      }
    },
    [payload],
    { initialValue: undefined, callWithTruthyDeps: true }
  )

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

  useEffect(() => {
    setHasPayload(!!payload)
  }, [payload])

  useEffect(() => {
    if (key) {
      setPrivateKey(key)
    }
  }, [key])

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <Button
          disabled={hasPayload}
          onClick={async () => {
            const { url } = await Governance.get().getDiscourseConnectUrl()
            openUrl(url, false)
          }}
        >
          Connect
        </Button>
        <div>
          {keyState.loading && <span>Loading...</span>}
          {!keyState.loading && key && <span>Connection Succesful</span>}
          {keyState.error && <span>Error: {keyState.error.message}</span>}
        </div>
      </div>
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
