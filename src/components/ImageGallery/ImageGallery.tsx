import React, { useState } from 'react'

import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Autoplay, Navigation, Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/react'

import './ImageGallery.css'
import ImageGalleryFullscreen from './ImageGalleryFullscreen'

interface Props {
  className?: string
  imageUrls: string[]
}

const NO_IMAGE = require('../../images/no-image.png').default

function ImageGallery({ className, imageUrls }: Props) {
  const responsive = useResponsive()
  const isNarrowScreen = responsive({ maxWidth: 991 })
  const [openFullscreen, setOpenFullscreen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const imageClickHandler = (index: number) => {
    setSelectedImage(index)
    setOpenFullscreen(true)
  }

  return (
    <>
      {imageUrls.length > 0 && (
        <>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={isNarrowScreen ? 3 : 4}
            spaceBetween={10}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            className={TokenList.join(['ImageGallery__Carousel', className])}
          >
            {imageUrls.map((imageUrl, index) => (
              <SwiperSlide key={index} onClick={() => imageClickHandler(index)}>
                <img src={imageUrl} onError={(e) => (e.currentTarget.src = NO_IMAGE)} />
              </SwiperSlide>
            ))}
          </Swiper>
          <ImageGalleryFullscreen
            className={TokenList.join(['ImageGallery__Carousel--fullscreen', className])}
            open={openFullscreen}
            imageUrls={imageUrls}
            onClose={() => setOpenFullscreen(false)}
            startIndex={selectedImage}
          />
        </>
      )}
    </>
  )
}

export default ImageGallery
