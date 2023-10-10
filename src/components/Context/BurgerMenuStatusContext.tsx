import { createContext, useState } from 'react'

import { useProposalsSearchParams } from '../../hooks/useProposalsSearchParams'

type BurgerMenuStatusContextProps = {
  children: React.ReactNode
}

type BurgerMenuStatus = {
  open: boolean
  searching: boolean
  filtering: boolean
  translate?: string
  snapshotStatusBarOpen: boolean
}

export type BurgerMenuStatusContextType = {
  status: BurgerMenuStatus
  setStatus: React.Dispatch<React.SetStateAction<BurgerMenuStatus>>
}

export const BurgerMenuStatusContext = createContext<BurgerMenuStatusContextType>({} as BurgerMenuStatusContextType)

const BurgerMenuStatusContextProvider = ({ children }: BurgerMenuStatusContextProps) => {
  const searchParams = useProposalsSearchParams()
  const filtering =
    !!searchParams.type || !!searchParams.status || (!!searchParams.timeFrame && searchParams.timeFrame.length > 0)
  const [status, setStatus] = useState({
    open: searchParams.searching || filtering,
    searching: searchParams.searching,
    filtering: filtering,
    snapshotStatusBarOpen: false,
  })
  return <BurgerMenuStatusContext.Provider value={{ status, setStatus }}>{children}</BurgerMenuStatusContext.Provider>
}

export default BurgerMenuStatusContextProvider
