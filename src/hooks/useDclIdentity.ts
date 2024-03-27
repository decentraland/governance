import { useEffect, useState } from 'react'

import { AuthIdentity } from 'decentraland-crypto-fetch'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

export default function useDclIdentity() {
  const [userAddress] = useAuthContext()
  const [identity, setIdentity] = useState<AuthIdentity | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !!userAddress) {
      const ssoData = localStorage.getItem(`single-sign-on-${userAddress}`)
      setIdentity(JSON.parse(ssoData || ''))
    }
  }, [userAddress])

  return identity as AuthIdentity
}
