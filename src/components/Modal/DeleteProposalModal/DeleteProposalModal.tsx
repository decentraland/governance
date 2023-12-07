import useFormatMessage from '../../../hooks/useFormatMessage'
import ConfirmationModal from '../ConfirmationModal'

interface Props {
  onClickAccept: () => void
  onClose: () => void
  open: boolean
  loading: boolean
}

export function DeleteProposalModal({ onClickAccept, onClose, open, loading }: Props) {
  const t = useFormatMessage()

  return (
    <ConfirmationModal
      isOpen={open}
      isLoading={loading}
      title={t('modal.delete_proposal.title')}
      description={t('modal.delete_proposal.description')}
      onPrimaryClick={onClickAccept}
      onSecondaryClick={onClose}
      onClose={onClose}
      primaryButtonText={t('modal.delete_proposal.accept')}
      secondaryButtonText={t('modal.delete_proposal.reject')}
    />
  )
}
