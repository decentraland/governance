import React, {createContext, useState} from 'react'

type BurgerMenuShowContextProps = {
	children: React.ReactNode
}

type BurgerMenuShowContextType = {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export const BurgerMenuShowContext = createContext<BurgerMenuShowContextType | null>(null)

const BurgerMenuShowContextProvider = ({children}: BurgerMenuShowContextProps) => {
  const [show, setShow] = useState(false)
	return <BurgerMenuShowContext.Provider value={{show, setShow}}>{children}</BurgerMenuShowContext.Provider>
}

export default BurgerMenuShowContextProvider