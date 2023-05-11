import React, { createContext, useState } from 'react'

type IdentityModalContextProps = {
  children: React.ReactNode
}

export type IdentityModalContextType = {
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const IdentityModalContext = createContext<IdentityModalContextType>({} as IdentityModalContextType)

function IdentityModalContextProvider({ children }: IdentityModalContextProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <IdentityModalContext.Provider value={{ isModalOpen, setIsModalOpen }}>{children}</IdentityModalContext.Provider>
  )
}

export default IdentityModalContextProvider
