import { forumUrl } from '../../entities/Proposal/utils'
import { getUpdateUrl } from '../../entities/Updates/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalUpdate from '../../hooks/useProposalUpdate'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

export default function UpdateSuccessModal({ updateId, proposalId, ...props }: SuccessModalProps) {
  const t = useFormatMessage()
  const { update } = useProposalUpdate(updateId)
  const linkToCopy = getUpdateUrl(updateId, proposalId)
  const linkToForum = update ? forumUrl(update?.discourse_topic_slug, update?.discourse_topic_id) : ''

  return (
    <SuccessModal
      title={t('modal.update_success.title')}
      description={t('modal.update_success.description')}
      linkToCopy={linkToCopy}
      linkToForum={linkToForum}
      {...props}
    />
  )
}
