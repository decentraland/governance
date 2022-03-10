import React, { useContext } from 'react'
import { BurgerMenuShowContext } from '../Context/BurgerMenuShowContext'
import { BurgerMenuStatusContext } from '../Context/BurgerMenuStatusContext'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './BurgerMenu.css'

function BurgerMenu() {
  const statusContext = useContext(BurgerMenuStatusContext)
  const showContext = useContext(BurgerMenuShowContext)

  const toggleMenuHandler = () => {
    statusContext?.setStatus(prev => !prev)
  }

  return <div onClick={toggleMenuHandler} className={TokenList.join([!showContext?.show && 'BurgerMenu--hidden'])}>
    <div className='BurgerMenu'>
      <div className='Bar' style={{transform: `${statusContext?.status ? 'rotate(45deg)' : 'rotate(0)'}`}}/>
      <div className='Bar' style={{transform: `${statusContext?.status ? 'translateX(100%)' : 'translateX(0)'}`, opacity: `${statusContext?.status ? 0 : 1}`}}/>
      <div className='Bar' style={{transform: `${statusContext?.status ? 'rotate(-45deg)' : 'rotate(0)'}`}}/>
    </div>
  </div>
}

export default BurgerMenu
