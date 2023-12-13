import useFormatMessage from '../../../hooks/useFormatMessage'
import ConfirmationModal from '../ConfirmationModal'

interface Props {
  loading: boolean
  open: boolean
  onClickAccept: () => void
  onClose: () => void
}

export function EditUpdateModal({ onClickAccept, loading, open, onClose }: Props) {
  const t = useFormatMessage()

  return (
    <ConfirmationModal
      isOpen={open}
      isLoading={loading}
      title={t('modal.edit_update.title')}
      description={t('modal.edit_update.description')}
      onPrimaryClick={onClickAccept}
      onSecondaryClick={onClose}
      onClose={onClose}
      primaryButtonText={t('modal.edit_update.accept')}
      secondaryButtonText={t('modal.edit_update.reject')}
    />
  )
}
