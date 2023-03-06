import React from 'react'

import Title from 'decentraland-gatsby/dist/components/Text/Title'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import ImageGallery from '../../ImageGallery/ImageGallery'

interface Props {
  imageUrls: string[]
}

function ProposalImagesPreview({ imageUrls }: Props) {
  const t = useFormatMessage()
  return (
    <div className="ProposalImagesPreview">
      <Title>{t('page.submit_linked_wearables.image_previews_label')}</Title>
      <ImageGallery className="ProposalImagesPreview__Gallery" imageUrls={imageUrls} />
    </div>
  )
}

export default ProposalImagesPreview
