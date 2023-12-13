import useFormatMessage from '../../../hooks/useFormatMessage'
import ConfirmationModal from '../ConfirmationModal'

interface Props {
  loading: boolean
  open: boolean
  onClickAccept: () => void
  onClose: () => void
}

export function VoteRegisteredModal({ onClickAccept, loading, open, onClose }: Props) {
  const t = useFormatMessage()

  return (
    <ConfirmationModal
      isOpen={open}
      title={t('modal.vote_registered.title')}
      description={t('modal.vote_registered.description')}
      isLoading={loading}
      onPrimaryClick={onClickAccept}
      onSecondaryClick={onClose}
      onClose={onClose}
      primaryButtonText={t('modal.vote_registered.accept')}
      secondaryButtonText={t('modal.vote_registered.reject')}
    />
  )
}
