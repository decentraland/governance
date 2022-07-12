import React from 'react'

import Title from 'decentraland-gatsby/dist/components/Text/Title'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalAttributes } from '../../entities/Proposal/types'
import ImageGallery from '../ImageGallery/ImageGallery'

interface Props {
  proposal: ProposalAttributes
}

function ProposalImagePreview({ proposal }: Props) {
  const t = useFormatMessage()
  return (
    <div className="ProposalImagePreview">
      <Title>{t('page.submit_linked_wearables.image_previews_label')}</Title>
      <ImageGallery className="ProposalImagePreview__Gallery" imageUrls={proposal.configuration.image_previews} />
    </div>
  )
}

export default ProposalImagePreview
