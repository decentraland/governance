import React from 'react'
import Flickity, { FlickityOptions } from 'react-flickity-component'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import 'flickity/css/flickity.css'

import './ImageGallery.css'

interface Props {
  options?: FlickityOptions
  className?: string
}

function ImageGallery({ options, className }: Props) {
  const galleryOptions: FlickityOptions = {
    initialIndex: 0,
    cellSelector: '.ImageGallery__CarouselCell',
    cellAlign: 'center',
    accessibility: true,
    pageDots: false,
    wrapAround: true,
    autoPlay: 10000,
    groupCells: false,
    setGallerySize: true,
    ...options,
  }

  const cellClass = galleryOptions.cellSelector?.slice(1)

  return (
    <Flickity className={TokenList.join(['ImageGallery__Carousel', className])} options={galleryOptions}>
      <div className={TokenList.join(['ImageGallery__CarouselCell--Container', cellClass])}>
        <img src="https://picsum.photos/id/1018/1000/600/" />
      </div>
      <div className={TokenList.join(['ImageGallery__CarouselCell--Container', cellClass])}>
        <img src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg" />
      </div>
      <div className={TokenList.join(['ImageGallery__CarouselCell--Container', cellClass])}>
        <img src="https://picsum.photos/id/1019/1000/600/" />
      </div>
      <div className={TokenList.join(['ImageGallery__CarouselCell--Container', cellClass])}>
        <img src="https://ps.w.org/tiny-compress-images/assets/icon-256x256.png" />
      </div>
    </Flickity>
  )
}

export default ImageGallery
