import React from 'react'

import Title from 'decentraland-gatsby/dist/components/Text/Title'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalAttributes } from '../../entities/Proposal/types'
import ImageGallery from '../ImageGallery/ImageGallery'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proposal: ProposalAttributes<any>
  isVisible: boolean
}

function ProposalImagePreview({ proposal, isVisible }: Props) {
  const t = useFormatMessage()
  return (
    <>
      {isVisible && !!proposal.configuration.image_previews && (
        <div className="ProposalImagePreview">
          <Title>{t('page.submit_linked_wearables.image_previews_label')}</Title>
          <ImageGallery className="ProposalImagePreview__Gallery" imageUrls={proposal.configuration.image_previews} />
        </div>
      )}
    </>
  )
}

export default ProposalImagePreview
