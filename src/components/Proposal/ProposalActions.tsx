import { useState } from 'react'

import { useIsMutating } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../../clients/Governance'
import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { isProposalDeletable, isProposalEnactable, proposalCanBePassedOrRejected } from '../../entities/Proposal/utils'
import useAsyncTask from '../../hooks/useAsyncTask'
import useFormatMessage from '../../hooks/useFormatMessage'
import useIsDAOCommittee from '../../hooks/useIsDAOCommittee'
import useIsProposalOwner from '../../hooks/useIsProposalOwner'
import { getProposalQueryKey } from '../../hooks/useProposal'
import locations, { navigate } from '../../utils/locations'
import { DeleteProposalModal } from '../Modal/DeleteProposalModal/DeleteProposalModal'
import { UpdateProposalStatusModal } from '../Modal/UpdateProposalStatusModal/UpdateProposalStatusModal'

interface Props {
  proposal: ProposalAttributes
}

export default function ProposalActions({ proposal }: Props) {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { isDAOCommittee } = useIsDAOCommittee(account)
  const { isOwner } = useIsProposalOwner(proposal)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [confirmStatusUpdate, setConfirmStatusUpdate] = useState<ProposalStatus | null>(null)
  const [deleting, deleteProposal] = useAsyncTask(async () => {
    if (proposal && account && (proposal.user === account || isDAOCommittee)) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  }, [proposal, account, isDAOCommittee])

  const updatingStatus = useIsMutating({ mutationKey: [`updatingProposal#${proposal.id}`] }) > 0

  const proposalStatus = proposal?.status
  const showDeleteButton = isOwner || isDAOCommittee
  const showEnactButton = isDAOCommittee && isProposalEnactable(proposalStatus)
  const showStatusUpdateButton = isDAOCommittee && proposalCanBePassedOrRejected(proposalStatus)

  return (
    <>
      {showDeleteButton && (
        <Button
          basic
          fluid
          loading={deleting}
          disabled={!isProposalDeletable(proposalStatus)}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          {t('page.proposal_detail.delete')}
        </Button>
      )}
      {showEnactButton && (
        <Button basic loading={updatingStatus} fluid onClick={() => setConfirmStatusUpdate(ProposalStatus.Enacted)}>
          {t(
            proposalStatus === ProposalStatus.Passed
              ? 'page.proposal_detail.enact'
              : 'page.proposal_detail.edit_enacted_data'
          )}
        </Button>
      )}
      {showStatusUpdateButton && (
        <>
          <Button basic loading={updatingStatus} fluid onClick={() => setConfirmStatusUpdate(ProposalStatus.Passed)}>
            {t('page.proposal_detail.pass')}
          </Button>
          <Button basic loading={updatingStatus} fluid onClick={() => setConfirmStatusUpdate(ProposalStatus.Rejected)}>
            {t('page.proposal_detail.reject')}
          </Button>
        </>
      )}
      <DeleteProposalModal
        loading={deleting}
        open={isDeleteModalOpen}
        onClickAccept={() => deleteProposal()}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      <UpdateProposalStatusModal
        open={!!confirmStatusUpdate}
        proposal={proposal}
        isDAOCommittee={isDAOCommittee}
        status={confirmStatusUpdate}
        proposalKey={getProposalQueryKey(proposal.id)}
        onClose={() => setConfirmStatusUpdate(null)}
      />
    </>
  )
}
