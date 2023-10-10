import { useIsMutating } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { isProposalDeletable, isProposalEnactable, proposalCanBePassedOrRejected } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useIsDAOCommittee from '../../hooks/useIsDAOCommittee'
import useIsProposalOwner from '../../hooks/useIsProposalOwner'
import { ProposalPageState } from '../../pages/proposal'

type ProposalActionsProps = {
  deleting: boolean
  proposal: ProposalAttributes
  updatePageState: (newState: Partial<ProposalPageState>) => void
}

export default function ProposalActions({ proposal, deleting, updatePageState }: ProposalActionsProps) {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { isDAOCommittee } = useIsDAOCommittee(account)
  const { isOwner } = useIsProposalOwner(proposal)

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
          onClick={() => updatePageState({ confirmDeletion: true })}
        >
          {t('page.proposal_detail.delete')}
        </Button>
      )}
      {showEnactButton && (
        <Button
          basic
          loading={updatingStatus}
          fluid
          onClick={() =>
            updatePageState({
              confirmStatusUpdate: ProposalStatus.Enacted,
            })
          }
        >
          {t(
            proposalStatus === ProposalStatus.Passed
              ? 'page.proposal_detail.enact'
              : 'page.proposal_detail.edit_enacted_data'
          )}
        </Button>
      )}
      {showStatusUpdateButton && (
        <>
          <Button
            basic
            loading={updatingStatus}
            fluid
            onClick={() => updatePageState({ confirmStatusUpdate: ProposalStatus.Passed })}
          >
            {t('page.proposal_detail.pass')}
          </Button>
          <Button
            basic
            loading={updatingStatus}
            fluid
            onClick={() =>
              updatePageState({
                confirmStatusUpdate: ProposalStatus.Rejected,
              })
            }
          >
            {t('page.proposal_detail.reject')}
          </Button>
        </>
      )}
    </>
  )
}
