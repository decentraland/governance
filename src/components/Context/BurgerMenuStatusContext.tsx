import React, {createContext, useState} from 'react'

type BurgerMenuStatusContextProps = {
	children: React.ReactNode
}

type BurgerMenuStatus = {
  show: boolean,
  open: boolean,
  searching: boolean
  filtering: boolean
  translate?: string
}

type BurgerMenuStatusContextType = {
  status: BurgerMenuStatus
  setStatus: React.Dispatch<React.SetStateAction<BurgerMenuStatus>>
}

export const BurgerMenuStatusContext = createContext<BurgerMenuStatusContextType | null>(null)

const BurgerMenuStatusContextProvider = ({children}: BurgerMenuStatusContextProps) => {
  const [status, setStatus] = useState({show: false, open: false, searching: false, filtering: false})
	return <BurgerMenuStatusContext.Provider value={{status, setStatus}}>
    {children}
  </BurgerMenuStatusContext.Provider>
}

export default BurgerMenuStatusContextProvider
