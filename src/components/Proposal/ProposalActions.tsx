import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import useIsCommittee from '../../hooks/useIsCommittee'
import useIsProposalOwner from '../../hooks/useIsProposalOwner'
import { ProposalPageState } from '../../pages/proposal'

type ProposalActionsProps = {
  deleting: boolean
  updatingStatus: boolean
  proposal: ProposalAttributes
  updatePageState: (newState: Partial<ProposalPageState>) => void
}

export default function ProposalActions({ proposal, deleting, updatingStatus, updatePageState }: ProposalActionsProps) {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { isCommittee } = useIsCommittee(account)
  const { isOwner } = useIsProposalOwner(proposal)

  if (!proposal) return null

  const showDeleteButton = isOwner || isCommittee
  const showEnactButton =
    isCommittee && (proposal?.status === ProposalStatus.Passed || proposal?.status === ProposalStatus.Enacted)
  const showStatusUpdateButton = isCommittee && proposal?.status === ProposalStatus.Finished

  return (
    <>
      {showDeleteButton && (
        <Button
          basic
          fluid
          loading={deleting}
          disabled={proposal?.status !== ProposalStatus.Pending && proposal?.status !== ProposalStatus.Active}
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
            proposal?.status === ProposalStatus.Passed
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
