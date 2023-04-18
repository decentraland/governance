import React, { useEffect, useMemo, useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../clients/Governance'
import { openUrl } from '../helpers'

export default function Identity() {
  const params = useMemo(() => new URLSearchParams(location.search), [])
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

  useEffect(() => {
    setHasPayload(!!payload)
  }, [payload])

  return (
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
        {!keyState.loading && key && <span>Token: {key}</span>}
        {keyState.error && <span>Error: {keyState.error.message}</span>}
      </div>
    </div>
  )
}
