import React, {useState} from 'react';

import './BurgerMenu.css'

type BurgerMenuProps ={
  onClick: any
}

function BurgerMenu() {
  
  const [openMenu, setOpenMenu] = useState(false)

  const toggleMenuHandler = () => {
    setOpenMenu(prev => !prev)
  }

  return <div onClick={toggleMenuHandler}>
    <div className='BurgerMenu'>
      <div className='Bar' style={{transform: `${openMenu ? 'rotate(45deg)' : 'rotate(0)'}`}}/>
      <div className='Bar' style={{transform: `${openMenu ? 'translateX(100%)' : 'translateX(0)'}`, opacity: `${openMenu ? 0 : 1}`}}/>
      <div className='Bar' style={{transform: `${openMenu ? 'rotate(-45deg)' : 'rotate(0)'}`}}/>
    </div>
  </div>
}

export default React.memo(BurgerMenu);
