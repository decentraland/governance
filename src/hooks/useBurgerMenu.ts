import { useContext } from 'react'
import { BurgerMenuStatusContext, BurgerMenuStatusContextType } from '../components/Context/BurgerMenuStatusContext'

export function useBurgerMenu() {
  const context = useContext<BurgerMenuStatusContextType>(BurgerMenuStatusContext)
  if (context === undefined) {
    throw new Error(`useBurgerMenu must be used within BurgerMenuStatusContextProvider`)
  }

  return context
}
