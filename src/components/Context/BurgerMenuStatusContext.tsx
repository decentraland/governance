import React, {createContext, useState} from 'react'

type BurgerMenuStatusContextProps = {
	children: React.ReactNode
}

export type BurgerMenuStatusContextType = {
  status: boolean
  setStatus: React.Dispatch<React.SetStateAction<boolean>>
}

export const BurgerMenuStatusContext = createContext<BurgerMenuStatusContextType | null>(null)

const BurgerMenuStatusContextProvider = ({children}: BurgerMenuStatusContextProps) => {
  const [status, setStatus] = useState(false)
	return <BurgerMenuStatusContext.Provider value={{status, setStatus}}>{children}</BurgerMenuStatusContext.Provider>
}

export default BurgerMenuStatusContextProvider