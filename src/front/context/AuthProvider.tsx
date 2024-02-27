import React, { createContext, useContext, useEffect } from 'react'

import * as SSO from '@dcl/single-sign-on-client'
import isURL from 'validator/lib/isURL'

import useAuth from './useAuth'
import useTransaction from './useTransaction'

type AuthProviderProps = {
  // Url of the sso application (Eg: https://id.decentraland.org)
  sso?: string
}

type AuthContextType = ReturnType<typeof useAuth>

const defaultAuthState = [
  null,
  {
    selecting: false,
    loading: true,
    chainId: null,
    providerType: null,
    provider: null,
    error: null,
    switchTo: () => {},
    select: () => {},
    connect: () => {},
    authorize: () => {},
    disconnect: () => {},
  },
] as unknown as AuthContextType

const defaultTransactionState: ReturnType<typeof useTransaction> = [
  [],
  {
    add: () => {},
    clear: () => {},
  },
]

export const AuthContext = createContext(defaultAuthState)
export const TransactionContext = createContext(defaultTransactionState)
export function useAuthContext() {
  return useContext(AuthContext)
}
export default React.memo(function AuthProvider({ sso, children }: React.PropsWithChildren<AuthProviderProps>) {
  const auth = useAuth()
  const transactions = useTransaction(auth[0], auth[1].chainId)

  // TODO: Remove after all dApps get the user identity from localhost
  // Initialize SSO
  // Will only be initialized if the sso url is provided.
  // If the url is not provided, the identity of the user will be stored in the application's local storage instead of the sso local storage.
  useEffect(() => {
    if (sso && isURL(sso)) {
      SSO.init(sso)
    }
  }, [])

  return (
    <AuthContext.Provider value={auth}>
      <TransactionContext.Provider value={transactions}>{children}</TransactionContext.Provider>
    </AuthContext.Provider>
  )
})
