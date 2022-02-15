import React, { useContext, useMemo } from 'react'
import { BurgerMenuStatusContext } from '../Context/BurgerMenuStatusContext'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './BurgerMenu.css'

function BurgerMenu() {
  const menuContext = useContext(BurgerMenuStatusContext)
  const [show, open, searching, filtering] = [
    menuContext?.status.show,
    menuContext?.status.open,
    menuContext?.status.searching,
    menuContext?.status.filtering
  ]

  const handleClick = () => {
    if (!searching) {
      menuContext?.setStatus((prevState) => ({
        ...prevState,
        open: !menuContext.status.open,
        filtering: false
      }))
    } else {
      menuContext?.setStatus((prevState) => ({
        ...prevState, filtering: !menuContext.status.filtering
      }))
    }
  }

  const [bar1, bar2, bar3] = useMemo(() => {
    if (searching && !filtering)
      // draw filter shape
      return [
        'rotate(0)',
        'scale(.75, 0.8) translateX(0) translateX(15%)',
        'scale(0.15, 0.8) rotate(0) translateX(5rem)'
      ]
    else if (open || filtering)
      // draw X
      return ['rotate(45deg)', 'translateX(0) translateX(200%)', 'rotate(-45deg)']
    // draw burger
    else return ['rotate(0)', 'translateX(0)', 'rotate(0)']
  }, [open, searching, filtering])

  return (
    <div onClick={handleClick} className={TokenList.join([!show && 'BurgerMenu--hidden'])}>
      <div className="BurgerMenu">
        <div className="Bar" style={{ transform: bar1 }} />
        <div className="Bar" style={{ transform: bar2, opacity: `${(!searching && open) || filtering ? 0 : 1}` }} />
        <div className="Bar" style={{ transform: bar3 }} />
      </div>
    </div>
  )
}

export default BurgerMenu
