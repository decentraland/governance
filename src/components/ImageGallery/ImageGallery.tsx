import React from 'react'
import Flickity, { FlickityOptions } from 'react-flickity-component'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import 'flickity-fullscreen'
import 'flickity-fullscreen/fullscreen.css'
import 'flickity/css/flickity.css'

import './ImageGallery.css'

type ImageGalleryOptions = FlickityOptions & { fullscreen?: boolean }

interface Props {
  options?: ImageGalleryOptions
  className?: string
  imageUrls: string[]
}

const NO_IMAGE = require('../../images/no-image.png').default

function ImageGallery({ options, className, imageUrls }: Props) {
  const galleryOptions: ImageGalleryOptions = {
    initialIndex: 0,
    cellSelector: '.ImageGallery__CarouselCell',
    cellAlign: 'center',
    accessibility: true,
    pageDots: false,
    wrapAround: true,
    autoPlay: 10000,
    groupCells: false,
    setGallerySize: true,
    fullscreen: true,
    ...options,
  }

  const cellClass = galleryOptions.cellSelector?.slice(1)

  return (
    <Flickity className={TokenList.join(['ImageGallery__Carousel', className])} options={galleryOptions}>
      {imageUrls.map((imageUrl, index) => (
        <div key={index} className={TokenList.join(['ImageGallery__CarouselCell--Container', cellClass])}>
          <img src={imageUrl} onError={(e) => (e.currentTarget.src = NO_IMAGE)} />
        </div>
      ))}
    </Flickity>
  )
}

export default ImageGallery
