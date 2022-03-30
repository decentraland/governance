import React, { createContext, useState } from 'react'
import { useSearchParams } from '../../hooks/useSearchParams'

type BurgerMenuStatusContextProps = {
  children: React.ReactNode
}

type BurgerMenuStatus = {
  open: boolean
  searching: boolean
  filtering: boolean
  translate?: string
}

export type BurgerMenuStatusContextType = {
  status: BurgerMenuStatus
  setStatus: React.Dispatch<React.SetStateAction<BurgerMenuStatus>>
}

export const BurgerMenuStatusContext = createContext<BurgerMenuStatusContextType>({ } as BurgerMenuStatusContextType)

const BurgerMenuStatusContextProvider = ({ children }: BurgerMenuStatusContextProps) => {
  const searchParams = useSearchParams()
  const filtering = !!(
    searchParams.type ||
    searchParams.status ||
    (searchParams.timeFrame && searchParams.timeFrame.length > 0)
  )

  const [status, setStatus] = useState({
    open: searchParams.searching || filtering,
    searching: searchParams.searching,
    filtering: filtering,
  })
  return <BurgerMenuStatusContext.Provider value={{ status, setStatus }}>{children}</BurgerMenuStatusContext.Provider>
}

export default BurgerMenuStatusContextProvider
