import { useContext, useEffect} from 'react'
import { BurgerMenuStatusContext } from '../components/Context/BurgerMenuStatusContext'
import { useSearchParams } from './useSearchParams'

export function useBurgerMenu() {
  const burgerMenu = useContext(BurgerMenuStatusContext)
  const {type, status, searching, timeFrame} = useSearchParams()

  useEffect(() => {
      const filtering =  !!(type || status || timeFrame && timeFrame.length > 0)
      burgerMenu?.setStatus((prevState) => ({
        ...prevState,
        show: true,
        open: searching || filtering,
        searching: searching,
        filtering: filtering
      }))

      return () => {
        burgerMenu?.setStatus({...burgerMenu.status, open: false, show: false})
      };
    },
    []);


  return burgerMenu
}
