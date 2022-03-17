import { useContext, useEffect } from 'react'
import { BurgerMenuShowContext } from '../components/Context/BurgerMenuShowContext'
import { BurgerMenuStatusContext } from '../components/Context/BurgerMenuStatusContext'

export function useBurgerMenu() {
  const burgerShow = useContext(BurgerMenuShowContext)
  const burgerMenu = useContext(BurgerMenuStatusContext)

  useEffect(() => {
    burgerShow?.setShow(true)
  
    return () => {
      burgerShow?.setShow(false)
      burgerMenu?.setStatus(false)
    };
  }, []);

  return burgerMenu
}