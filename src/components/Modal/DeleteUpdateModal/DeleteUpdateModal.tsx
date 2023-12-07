import useFormatMessage from '../../../hooks/useFormatMessage'
import ConfirmationModal from '../ConfirmationModal'

type Props = {
  loading?: boolean
  open: boolean
  onClickAccept: () => void
  onClose: () => void
}

export function DeleteUpdateModal({ onClickAccept, onClose, loading, open }: Props) {
  const t = useFormatMessage()

  return (
    <ConfirmationModal
      isOpen={open}
      isLoading={loading}
      title={t('modal.delete_update.title')}
      description={t('modal.delete_update.description')}
      onPrimaryClick={onClickAccept}
      onSecondaryClick={onClose}
      onClose={onClose}
      primaryButtonText={t('modal.delete_update.accept')}
      secondaryButtonText={t('modal.delete_update.reject')}
    />
  )
}
