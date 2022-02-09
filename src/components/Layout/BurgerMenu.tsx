import React, { useContext } from 'react'
import { BurgerMenuShowContext } from '../Context/BurgerMenuShowContext'
import { BurgerMenuStatusContext } from '../Context/BurgerMenuStatusContext'
import './BurgerMenu.css'

function BurgerMenu() {
  const statusContext = useContext(BurgerMenuStatusContext)
  const showContext = useContext(BurgerMenuShowContext)

  const toggleMenuHandler = () => {
    statusContext?.setStatus(prev => !prev)
  }

  return <div onClick={toggleMenuHandler} style={showContext?.show ? {} : {display: 'none'}}>
    <div className='BurgerMenu'>
      <div className='Bar' style={{transform: `${statusContext?.status ? 'rotate(45deg)' : 'rotate(0)'}`}}/>
      <div className='Bar' style={{transform: `${statusContext?.status ? 'translateX(100%)' : 'translateX(0)'}`, opacity: `${statusContext?.status ? 0 : 1}`}}/>
      <div className='Bar' style={{transform: `${statusContext?.status ? 'rotate(-45deg)' : 'rotate(0)'}`}}/>
    </div>
  </div>
}

export default React.memo(BurgerMenu)
