import React, { useEffect, useMemo, useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../clients/Governance'
import { openUrl } from '../helpers'

export default function Identity() {
  const params = useMemo(() => new URLSearchParams(location.search), [])
  const payload = params.get('payload')
  const [hasPayload, setHasPayload] = useState(false)
  const [token, tokenState] = useAsyncMemo(
    async () => {
      if (payload) {
        const { userApiKey } = await Governance.get().setDiscourseConnectToken(payload)
        return userApiKey
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
        {tokenState.loading && <span>Loading...</span>}
        {!tokenState.loading && token && <span>Token: {token}</span>}
        {tokenState.error && <span>Error: {tokenState.error.message}</span>}
      </div>
    </div>
  )
}
