import { useRef } from 'react'
import Flickity, { FlickityOptions } from 'react-flickity-component'

import classNames from 'classnames'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import './MobileSlider.css'

const flickityOptions: FlickityOptions = {
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
  containerClassName?: string
}

export default function MobileSlider({ children, className, containerClassName }: Props) {
  const flickity = useRef<Flickity>()

  return (
    <>
      <Mobile>
        <Flickity
          className={classNames('MobileSlider', className)}
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {children}
        </Flickity>
      </Mobile>
      <NotMobile>
        <div className={containerClassName}>{children}</div>
      </NotMobile>
    </>
  )
}
