import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'

import { useBurgerMenu } from '../../hooks/useBurgerMenu'

import './BurgerMenu.css'

const FILTER_SHAPE_TRANSFORMS = [
  'rotate(0)',
  'scale(.75, 0.8) translateX(0) translateX(15%)',
  'scale(0.15, 0.8) rotate(0) translateX(5rem)',
]
const CROSS_SHAPE_TRANSFORMS = ['rotate(45deg)', 'translateX(0) translateX(200%)', 'rotate(-45deg)']
const BURGER_SHAPE_TRANSFORMS = ['rotate(0)', 'translateX(0)', 'rotate(0)']

function BurgerMenu() {
  const location = useLocation()
  const { status, setStatus } = useBurgerMenu()
  const { open, searching, filtering } = status
  const showBurgerMenu = location.pathname === '/' || location.pathname === '/transparency/'

  const handleClick = () => {
    if (!searching) {
      setStatus((prevState) => ({
        ...prevState,
        open: !prevState.open,
        filtering: false,
      }))
    } else {
      setStatus((prevState) => ({
        ...prevState,
        filtering: !prevState.filtering,
      }))
    }
  }

  const [bar1, bar2, bar3] = useMemo(() => {
    if (searching && !filtering) return FILTER_SHAPE_TRANSFORMS
    else if (open || filtering) return CROSS_SHAPE_TRANSFORMS
    else return BURGER_SHAPE_TRANSFORMS
  }, [open, searching, filtering])

  if (!showBurgerMenu) {
    return null
  }

  return (
    <div onClick={handleClick} className="BurgerMenu">
      <div className="Bar" style={{ transform: bar1 }} />
      <div className="Bar" style={{ transform: bar2, opacity: `${(!searching && open) || filtering ? 0 : 1}` }} />
      <div className="Bar" style={{ transform: bar3 }} />
    </div>
  )
}

export default BurgerMenu
