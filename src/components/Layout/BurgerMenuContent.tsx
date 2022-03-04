import React, {useContext, useState, useEffect} from 'react'
import { BurgerMenuStatusContext } from '../Context/BurgerMenuStatusContext'

type BurgerMenuContentProps = {
  footerTranslate: string,
  children: React.ReactNode
}

function BurgerMenuContent({footerTranslate, children} : BurgerMenuContentProps) {
  const [footer, setFooter] = useState<Element | null>(null)
  const burgerMenu = useContext(BurgerMenuStatusContext)

  useEffect(() => {
    setFooter(document.querySelectorAll(".dcl.footer")[0])
    return () => {
      if(footer) {
        footer.setAttribute("style", "")
      }
    }
  }, [])

  useEffect(() => {
    if(footer) {
      footer.classList.add('Animated')
      if(burgerMenu?.status) {
        footer.setAttribute("style", `transform: translateY(${footerTranslate})`)
      }
      else {
        footer.setAttribute("style", "")
      }
    }
  }, [footer, burgerMenu?.status])

  return (
    <div className='BurgerMenuContent Animated'
      style={{
        position: 'absolute',
        width: "100%",
        transform: `${burgerMenu?.status ? '' : 'translateY(-200%)'}`,
      }}
    >
      {children}
    </div>
  )
}

export default React.memo(BurgerMenuContent)
