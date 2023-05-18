import { useContext } from 'react'

import { IdentityModalContext, IdentityModalContextType } from '../components/Context/IdentityModalContext'

function useIdentityModalContext() {
  const context = useContext<IdentityModalContextType>(IdentityModalContext)
  if (context === undefined) {
    throw new Error('useIdentityModalContext must be used within IdentityModalContextProvider')
  }
  return context
}

export default useIdentityModalContext
