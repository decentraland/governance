import { createContext, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'

import { SegmentEvent } from '../../entities/Events/types'

type IdentityModalContextProps = {
  children: React.ReactNode
}

export type IdentityModalContextType = {
  isModalOpen: boolean
  setIsModalOpen: (value: boolean) => void
}

export const IdentityModalContext = createContext<IdentityModalContextType>({} as IdentityModalContextType)

function IdentityModalContextProvider({ children }: IdentityModalContextProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user] = useAuthContext()
  const track = useTrackContext()
  const setIsModalOpenWithTracking = (isOpen: boolean) => {
    setIsModalOpen(isOpen)
    if (isOpen) {
      track(SegmentEvent.ModalViewed, { address: user, modal: 'Identity' })
    }
  }
  return (
    <IdentityModalContext.Provider value={{ isModalOpen, setIsModalOpen: setIsModalOpenWithTracking }}>
      {children}
    </IdentityModalContext.Provider>
  )
}

export default IdentityModalContextProvider
