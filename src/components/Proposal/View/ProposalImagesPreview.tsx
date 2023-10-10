import useFormatMessage from '../../../hooks/useFormatMessage'
import ArticleSectionHeading from '../../Common/ArticleSectionHeading'
import ImageGallery from '../../ImageGallery/ImageGallery'

interface Props {
  imageUrls: string[]
}

function ProposalImagesPreview({ imageUrls }: Props) {
  const t = useFormatMessage()
  return (
    <div className="ProposalImagesPreview">
      <ArticleSectionHeading>{t('page.submit_linked_wearables.image_previews_label')}</ArticleSectionHeading>
      <ImageGallery className="ProposalImagesPreview__Gallery" imageUrls={imageUrls} />
    </div>
  )
}

export default ProposalImagesPreview
