import React, { useRef } from 'react'
import Flickity from 'react-flickity-component'

import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import './MobileSlider.css'

const flickityOptions = {
  cellAlign: 'left',
  accessibility: true,
  pageDots: false,
  prevNextButtons: false,
  draggable: true,
  dragThreshold: 10,
  selectedAttraction: 0.01,
  friction: 0.15,
}

interface Props {
  children: React.ReactNode
  className?: string
}

export default function MobileSlider({ children, className }: Props) {
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const flickity = useRef<Flickity>()

  return (
    <>
      {isMobile ? (
        <Flickity
          className={TokenList.join(['MobileSlider', className])}
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {children}
        </Flickity>
      ) : (
        children
      )}
    </>
  )
}
