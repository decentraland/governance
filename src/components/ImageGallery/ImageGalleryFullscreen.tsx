import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Keyboard, Navigation, Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/react'

import './ImageGallery.css'

type Props = ModalProps & {
  imageUrls: string[]
  startIndex?: number
  navigation?: boolean
}

const NO_IMAGE = require('../../images/no-image.png').default

function ImageGalleryFullscreen({ open, onClose, className, imageUrls, startIndex, navigation }: Props) {
  return (
    <Modal size="fullscreen" open={open} closeIcon={<Close />} onClose={onClose} className={className}>
      <Modal.Content>
        <Swiper
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination, Keyboard]}
          navigation={navigation}
          className={className}
          initialSlide={startIndex}
          keyboard={{ enabled: true }}
        >
          {imageUrls.map((imageUrl, index) => (
            <SwiperSlide key={index}>
              <img src={imageUrl} onError={(e) => (e.currentTarget.src = NO_IMAGE)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Modal.Content>
    </Modal>
  )
}

export default ImageGalleryFullscreen
