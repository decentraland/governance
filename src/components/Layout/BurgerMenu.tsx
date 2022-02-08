import React, { useContext } from 'react'
import { BurgerMenuStatusContext } from '../Context/BurgerMenuStatusContext'
import './BurgerMenu.css'

function BurgerMenu() {
  const context = useContext(BurgerMenuStatusContext)

  const toggleMenuHandler = () => {
    context?.setStatus(prev => !prev)
  }

  return <div onClick={toggleMenuHandler}>
    <div className='BurgerMenu'>
      <div className='Bar' style={{transform: `${context?.status ? 'rotate(45deg)' : 'rotate(0)'}`}}/>
      <div className='Bar' style={{transform: `${context?.status ? 'translateX(100%)' : 'translateX(0)'}`, opacity: `${context?.status ? 0 : 1}`}}/>
      <div className='Bar' style={{transform: `${context?.status ? 'rotate(-45deg)' : 'rotate(0)'}`}}/>
    </div>
  </div>
}

export default React.memo(BurgerMenu)
